import type { Bench } from 'tinybench';
import { createSignal, createEffect } from '../src';

export default (bench: Bench) => {
  const [ldCount, setLdCount] = createSignal(0);
  createEffect(() => ldCount()); // Create a dependency

  bench.add('LD Signal Update', () => {
    setLdCount(ldCount() + 1);
  });
};
