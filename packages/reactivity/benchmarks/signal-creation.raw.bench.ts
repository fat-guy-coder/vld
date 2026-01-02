/**
 * @description 这是一个原始的、不依赖 tinybench 的基准测试脚本。
 *              目的：排除测试框架本身的开销，测量 createSignal 函数最纯粹的性能。
 */
import { createSignal } from '../src';
import { performance } from 'perf_hooks';

const ITERATIONS = 5_000_000;

function runRawBenchmark() {
  console.log(`
🚀 Running Raw Performance Benchmark for createSignal...
`);

  // 预热阶段，让 JIT 编译器有机会优化代码
  for (let i = 0; i < 1_000_000; i++) {
    createSignal(i);
  }

  const startTime = performance.now();

  for (let i = 0; i < ITERATIONS; i++) {
    createSignal(i);
  }

  const endTime = performance.now();
  const duration = endTime - startTime;
  const opsPerSec = (ITERATIONS / duration) * 1000;

  console.log('--- Raw Benchmark Results ---');
  console.log(`Total Iterations: ${ITERATIONS.toLocaleString()}`);
  console.log(`Total Time: ${duration.toFixed(2)} ms`);
  console.log(`Operations/sec: ${opsPerSec.toLocaleString(undefined, { maximumFractionDigits: 0 })}
`);
}

// 直接运行
runRawBenchmark();

