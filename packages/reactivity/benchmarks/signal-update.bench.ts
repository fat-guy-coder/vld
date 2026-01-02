import type { Bench } from 'tinybench';
import { createSignal, createEffect } from '../src';

export default (bench: Bench): void => {
  const count = createSignal(0);

  // Create a dependency so the update has an effect to run.
  createEffect(() => count(), { scheduler: null, dynamic: false });

  bench.add('LD Signal Update', () => {
    for (let i = 0; i < 1000; i++) {
      count.set(v => v + 1);
    }
  });
};
