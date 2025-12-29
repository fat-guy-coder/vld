import type { Bench } from 'tinybench';
import { createSignal, createEffect, type ReactiveEffect } from '../src';

export default (bench: Bench): void => {
  let effect: ReactiveEffect | null = null;
  const [count, setCount] = createSignal(0);

  bench.add('LD Signal Update', () => {
    setCount(count() + 1);
  }, {
    beforeEach() {
      // Create a dependency before each run
      if (!effect) {
        effect = createEffect(() => count());
      }
    },
    afterEach() {
      // Cleanup the effect after each run
      if (effect) {
        effect.stop();
        effect = null;
      }
    },
  });
};
