#!/usr/bin/env node

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import Table from 'cli-table3';
import { Bench } from 'tinybench';

// --- Import all benchmark files statically ---
import signalCreationBench from '../../packages/reactivity/benchmarks/signal-creation.bench.ts';
import signalUpdateBench from '../../packages/reactivity/benchmarks/signal-update.bench.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// --- An array of all benchmark functions to run ---
const allBenchmarks = [
  signalCreationBench,
  signalUpdateBench,
];

class BenchmarkRunner {
  private bench = new Bench({ time: 100 });

  async run(): Promise<void> {
    console.log(chalk.cyan('🏎️  Running LD Performance Benchmarks (Static Mode)\n'));

    this.addBenchmarkTasks();
    await this.bench.run();

    this.printLiveResults();
    this.printComparisonTable();

    console.log(chalk.green('\n✅ Benchmarking complete!'));
  }

  private addBenchmarkTasks(): void {
    console.log(chalk.blue('Adding benchmark tasks...'));
    allBenchmarks.forEach(benchFn => {
      if (typeof benchFn === 'function') {
        benchFn(this.bench);
      }
    });
    console.log(chalk.blue(`Added ${this.bench.tasks.length} tasks.`));
  }

  private printLiveResults(): void {
    console.log('\n' + chalk.cyan('📈 LD Live Benchmark Results:'));
    console.table(this.bench.table());
  }

  private printComparisonTable(): void {
    console.log('\n' + chalk.cyan('📊 Live Performance Comparison:'));
    
    const table = new Table({
        head: [chalk.bold('Metric'), chalk.bold('LD (Live)'), chalk.bold('SolidJS (Benchmark)')],
    });

    const ldSignalCreationTask = this.bench.tasks.find(t => t.name === 'LD Signal Creation');
    const ldSignalUpdateTask = this.bench.tasks.find(t => t.name === 'LD Signal Update');

    const ldSignalCreationOps = ldSignalCreationTask?.result?.hz || 0;
    const ldSignalUpdateOps = ldSignalUpdateTask?.result?.hz || 0;

    // Benchmark data for SolidJS based on community benchmarks for direct comparison.
    const solidSignalCreationOps = 2800000; // Target to beat
    const solidSignalUpdateOps = 8000000;   // Target to beat

    const formatOps = (ops: number) => (ops / 1_000_000).toFixed(2) + ' M ops/sec';

    const getHighlight = (ld: number, solid: number) => {
      if (!solid) return (text: string) => text;
      if (ld > solid) return chalk.green.bold; // Faster
      if (ld < solid * 0.9) return chalk.red.bold; // Significantly slower
      return chalk.yellow; // Close
    };

    const creationHighlight = getHighlight(ldSignalCreationOps, solidSignalCreationOps);
    const updateHighlight = getHighlight(ldSignalUpdateOps, solidSignalUpdateOps);

    table.push(
        ['Signal Creation', creationHighlight(formatOps(ldSignalCreationOps)), formatOps(solidSignalCreationOps)],
        ['Signal Update', updateHighlight(formatOps(ldSignalUpdateOps)), formatOps(solidSignalUpdateOps)]
    );

    console.log(table.toString());
  }
}

new BenchmarkRunner().run();
