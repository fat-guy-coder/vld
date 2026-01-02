import type { Bench } from 'tinybench';
import { createSignal, createEffect } from '../src';

export default (bench: Bench): void => {
  const count = createSignal(0);

  // Create the effect once; its updates will be measured.
  createEffect(() => {
    count();
  }, { scheduler: null, dynamic: false });

  bench.add('LD Effect Update', () => {
    for (let i = 0; i < 1000; i++) {
      count.set(v => v + 1);
    }
  });
};
