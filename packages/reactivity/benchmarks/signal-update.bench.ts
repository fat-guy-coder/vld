import type { Bench } from 'tinybench';
import { createSignal, createEffect } from '../src';

export default (bench: Bench) => {
  bench.add('LD Signal Update', () => {
    const [ldCount, setLdCount] = createSignal(0);
    const effect = createEffect(() => ldCount());

    setLdCount(ldCount() + 1);

    // Stop the effect immediately after the operation to allow the process to exit.
    effect.stop();
  });
};
