#!/usr/bin/env node
/*
 * Browser-based memory usage runner for LD framework.
 */

import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import puppeteer, { Browser, Page } from 'puppeteer';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const appDir = resolve(rootDir, 'src');
const PORT = 5174; // Use a different port than the main dev server

interface MemoryUsage {
  JSHeapUsedSize: number;
}

interface FrameworkData {
  frameworks: {
    [key: string]: {
      memory_usage_mb: number;
    };
  };
}

class MemoryRunner {
  private serverProcess: ChildProcess | null = null;
  private browser: Browser | null = null;
  private frameworksData: FrameworkData | null = null;

  async run(): Promise<void> {
    console.log(chalk.cyan.bold('🧠 LD Memory Usage Analysis (Browser Mode)\n'));

    const spinner = ora('Starting test environment...').start();
    try {
      await this.loadFrameworksData();
      this.serverProcess = this.startStaticServer();
      this.browser = await puppeteer.launch();
      const page = await this.browser.newPage();

      spinner.text = 'Navigating to test page...';
      await page.goto(`http://localhost:${PORT}`);
      await page.waitForSelector('#view-data-stats');

      spinner.text = 'Switching to memory tab...';
      await page.click('a[data-view="data-stats"]');
      await page.click('button[data-tab="module-memory"]');
      await page.waitForSelector('#run-memory-test-btn');

      spinner.text = 'Measuring baseline memory...';
      const baselineMemory = await this.getMemoryUsage(page);

      spinner.text = 'Running test: Creating 1,000 rows...';
      await page.evaluate(() => (window as any).runMemoryTest());
      await page.waitForSelector('.memory-test-row:nth-child(1000)'); // Wait for render

      spinner.text = 'Measuring final memory...';
      const finalMemory = await this.getMemoryUsage(page);

      const memoryIncreaseBytes = finalMemory.JSHeapUsedSize - baselineMemory.JSHeapUsedSize;
      const memoryIncreaseMb = memoryIncreaseBytes / 1024 / 1024;

      spinner.succeed('Memory measurement completed.');

      this.printResults(memoryIncreaseMb);
      await this.writeReport(memoryIncreaseMb);

    } catch (error) { 
      spinner.fail('An error occurred during the memory test.');
      console.error(chalk.red(error));
      process.exit(1);
    } finally {
      spinner.text = 'Cleaning up...';
      await this.browser?.close();
      this.serverProcess?.kill();
      spinner.stop();
    }
  }

  private startStaticServer(): ChildProcess {
    const server = spawn('npx', ['sirv-cli', appDir, '--port', String(PORT), '--dev'], {
      shell: true,
      stdio: 'pipe',
    });
    server.on('error', (err) => {
      console.error(chalk.red('Failed to start static server.'), err);
      process.exit(1);
    });
    return server;
  }

  private async getMemoryUsage(page: Page): Promise<MemoryUsage> {
    const metrics = await page.metrics();
    return {
      JSHeapUsedSize: metrics.JSHeapUsedSize,
    };
  }

  private async loadFrameworksData(): Promise<void> {
    const dataPath = resolve(rootDir, 'statistics', 'frameworks-data.json');
    try {
      const content = await fs.readFile(dataPath, 'utf-8');
      this.frameworksData = JSON.parse(content);
    } catch (e) {
      console.warn(chalk.yellow('⚠️ Could not load frameworks-data.json. Comparison will be skipped.'));
    }
  }

  private printResults(memoryMb: number): void {
    const table = new Table({
      head: [chalk.bold('Metric'), chalk.bold('Result'), chalk.bold('Target'), chalk.bold('Status')],
      colWidths: [30, 20, 20, 15],
    });

    const targetMb = this.frameworksData?.frameworks.solidjs.memory_usage_mb ?? 30;
    const isSuccess = memoryMb <= targetMb;
    const status = isSuccess ? chalk.green('PASS') : chalk.red('FAIL');

    table.push([
      'Memory Usage (1k rows)',
      `${memoryMb.toFixed(2)} MB`,
      `<= ${targetMb.toFixed(2)} MB (SolidJS)`,
      status,
    ]);

    console.log('\n' + chalk.cyan('📈 LD Memory Usage Results:'));
    console.log(table.toString());
  }

  private async writeReport(memoryMb: number): Promise<void> {
    const report = {
      createdAt: new Date().toISOString(),
      results: {
        scenario: 'Create 1,000 rows in browser',
        memoryUsageMb: memoryMb,
      },
    };
    const reportPath = resolve(rootDir, 'statistics', 'memory-analysis.json');
    await fs.mkdir(dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.green(`\n📄 Memory analysis report saved to: ${reportPath}`));
  }
}

new MemoryRunner().run();
