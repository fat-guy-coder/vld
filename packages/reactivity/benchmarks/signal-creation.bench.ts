import type { Bench } from 'tinybench';
import { createSignal } from '../src';

export default (bench: Bench) => {
  bench.add('LD Signal Creation', () => {
    createSignal(0);
  });
};
