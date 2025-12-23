import { describe, it, expect, vi } from 'vitest';
import { createSignal } from '../src/signal';
import { createEffect } from '../src/effect';
import { batch } from '../src/batch';

// Helper to wait for the next microtask
const nextTick = () => new Promise(resolve => setTimeout(resolve, 0));

describe('batch', () => {
  it('should batch multiple signal updates into a single effect run', async () => {
    const [count, setCount] = createSignal(0);
    const [name, setName] = createSignal('vld');
    const effectFn = vi.fn(() => {
      // Access both signals to create dependencies
      count();
      name();
    });

    createEffect(effectFn);
    expect(effectFn).toHaveBeenCalledTimes(1); // Initial run

    batch(() => {
      setCount(1);
      setName('vld-plus');
      // Effect should not run inside the batch
      expect(effectFn).toHaveBeenCalledTimes(1);
    });

    // Effect should run once after the batch in the next microtask
    expect(effectFn).toHaveBeenCalledTimes(1);
    await nextTick();
    expect(effectFn).toHaveBeenCalledTimes(2);
  });

  it('should handle nested batch calls', async () => {
    const [count, setCount] = createSignal(0);
    const effectFn = vi.fn(() => count());

    createEffect(effectFn);
    expect(effectFn).toHaveBeenCalledTimes(1);

    batch(() => {
      setCount(1);
      batch(() => {
        setCount(2);
      });
      expect(effectFn).toHaveBeenCalledTimes(1);
    });

    await nextTick();
    expect(effectFn).toHaveBeenCalledTimes(2);
    expect(count()).toBe(2);
  });

  it('should flush jobs immediately after the top-level batch', async () => {
    const [count, setCount] = createSignal(0);
    const effectFn = vi.fn(() => count());

    createEffect(effectFn);
    expect(effectFn).toHaveBeenCalledTimes(1);

    batch(() => {
      setCount(1);
    });

    await nextTick();
    expect(effectFn).toHaveBeenCalledTimes(2);
  });
});

