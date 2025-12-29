import type { Bench } from 'tinybench';
import { createSignal, createEffect } from '../src';

export default (bench: Bench) => {
  const [count, setCount] = createSignal(0);

  bench.add('LD Effect Update', () => {
    // Create the effect for dependency tracking inside the benchmark task.
    const effect = createEffect(() => {
      count();
    });

    // Trigger the effect by updating the signal.
    setCount(count() + 1);

    // Stop the effect immediately so that it doesn't keep the process alive.
    effect.stop();
  });
};

