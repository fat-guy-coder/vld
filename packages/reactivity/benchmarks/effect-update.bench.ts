import type { Bench } from 'tinybench';
import { createSignal, createEffect, type ReactiveEffect } from '../src';

export default (bench: Bench): void => {
  let i = 0;
  let effect: ReactiveEffect | null = null;
  const [count, setCount] = createSignal(0);

  bench.add('LD Effect Update', () => {
    setCount(i++);
  }, {
    beforeEach() {
      // Reset counter and ensure effect exists before each run
      i = 0;
      if (!effect) {
        effect = createEffect(() => {
          count();
        });
      }
    },
    afterEach() {
      // Cleanup the effect after each run to prevent hanging
      if (effect) {
        effect.stop();
        effect = null;
      }
    },
  });
};
