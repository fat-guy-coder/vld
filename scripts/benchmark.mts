#!/usr/bin/env node
/*
 * Dynamic benchmark runner
 * Usage:
 *   tsx scripts/benchmark.mts <module>
 * Examples:
 *   pnpm run bench:reactivity  (package.json already maps to this)
 *   pnpm run bench -- runtime-core
 *
 * The script will discover all `*.bench.ts` files inside
 *   packages/<module>/benchmarks/
 * dynamically import them, and execute every default-exported
 * function (signature: (bench: Bench) => void).
 */

import { join, dirname, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { glob } from 'glob';
import chalk from 'chalk';
import Table from 'cli-table3';
import { Bench } from 'tinybench';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// ---------------------- CLI args ----------------------
const [, , targetModule = 'reactivity'] = process.argv;

// Validate the module path exists
import { existsSync } from 'fs';
const moduleBenchDir = join(rootDir, 'packages', targetModule, 'benchmarks');
if (!existsSync(moduleBenchDir)) {
  console.error(
    chalk.red(
      `❌ Benchmarks directory not found for module "${targetModule}".\nExpected: ${moduleBenchDir}`
    )
  );
  process.exit(1);
}

// ------------------- Discover benchmarks --------------
console.log(
  chalk.cyan(
    `🏎️  Running LD Performance Benchmarks for module "${targetModule}"\n`
  )
);

const benchFilePattern = join(
  'packages',
  targetModule,
  'benchmarks',
  '**',
  '*.bench.ts'
);

const benchFilePaths = await glob(benchFilePattern, {
  cwd: rootDir,
  absolute: true,
  windowsPathsNoEscape: true,
});

if (!benchFilePaths.length) {
  console.log(
    chalk.yellow(
      `⚠️  No benchmark files (*.bench.ts) found under ${moduleBenchDir}. Nothing to run.`
    )
  );
  process.exit(0);
}

// ------------------- Load benchmarks ------------------
const dynamicBenchFns: Array<(bench: Bench) => void> = [];

for (const filePath of benchFilePaths) {
  try {
    const mod = await import(pathToFileURL(filePath).href);
    const benchFn = mod.default ?? mod;
    if (typeof benchFn === 'function') {
      dynamicBenchFns.push(benchFn);
    } else {
      console.warn(
        chalk.yellow(
          `⚠️  Benchmark file ${filePath} does not export a default function. Skipped.`
        )
      );
    }
  } catch (e) {
    console.error(chalk.red(`Failed to import ${filePath}`));
    console.error(e);
  }
}

if (!dynamicBenchFns.length) {
  console.error(chalk.red('❌ No valid benchmark functions found.'));
  process.exit(1);
}

// ------------------- Run benchmarks -------------------
class BenchmarkRunner {
  private bench = new Bench({ time: 100 }); // 100ms per task for quicker feedback

  async run() {
    this.addTasks();

    await this.bench.run();

    this.printResults();
  }

  private addTasks() {
    console.log(chalk.blue('Adding benchmark tasks...'));
    for (const fn of dynamicBenchFns) {
      try {
        fn(this.bench);
      } catch (err) {
        console.error(chalk.red('Error while adding benchmark task:'), err);
      }
    }
    console.log(chalk.blue(`Added ${this.bench.tasks.length} tasks.`));
  }

  private printResults() {
    console.log('\n' + chalk.cyan('📈 LD Live Benchmark Results:'));
    console.table(this.bench.table());
    // Optionally, integrate comparison logic here as needed per module
  }
}

await new BenchmarkRunner().run();
