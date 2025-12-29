import type { Bench } from 'tinybench';
import { createSignal, createComputed } from '../src';

export default (bench: Bench) => {
  const [count] = createSignal(0);
  const double = createComputed(() => count() * 2);

  bench.add('LD Computed Get', () => {
    double.value;
  });
};

