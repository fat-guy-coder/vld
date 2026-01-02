import type { Bench } from 'tinybench';
import { createSignal } from '../src';

/**
 * @description
 * This benchmark measures the raw performance of updating a signal's value when there are NO dependents (effects).
 * It aims to align with the `signal_update_ops_sec` metric, which represents pure reactive graph propagation cost.
 */
export default (bench: Bench): void => {
  const count = createSignal(0);

  bench.add('LD Signal Update (Pure)', () => {
    // We are not using a functional updater here because we want to measure the absolute raw cost
    // of the setter logic itself, without the overhead of a function call.
    for (let i = 0; i < 1000; i++) {
      count.set(i);
    }
  });
};


