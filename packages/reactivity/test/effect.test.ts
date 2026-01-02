import { describe, it, expect, vi } from 'vitest';
import { createSignal, createEffect, waitForJobs } from '../src';

describe('createEffect', () => {
  it('should run the effect function immediately', () => {
    const fn = vi.fn();
    createEffect(fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should re-run the effect when a dependency changes', async () => {
    const count = createSignal(0);
    const fn = vi.fn(() => count());

    createEffect(fn);
    expect(fn).toHaveBeenCalledTimes(1);

    count.set(1);
    await waitForJobs();
    expect(fn).toHaveBeenCalledTimes(2);

    count.set(2);
    await waitForJobs();
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should not re-run the effect when a dependency is set to the same value', async () => {
    const count = createSignal(0);
    const fn = vi.fn(() => count());

    createEffect(fn);
    expect(fn).toHaveBeenCalledTimes(1);

    count.set(0);
    await waitForJobs();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple dependencies', async () => {
    const a = createSignal(1);
    const b = createSignal(2);
    let sum = 0;

    const fn = vi.fn(() => {
      sum = a() + b();
    });

    createEffect(fn);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(sum).toBe(3);

    a.set(5);
    await waitForJobs();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(sum).toBe(7);

    b.set(10);
    await waitForJobs();
    expect(fn).toHaveBeenCalledTimes(3);
    expect(sum).toBe(15);
  });

  it('should support nested effects', async () => {
    const a = createSignal(0);
    const b = createSignal(0);

    const innerFn = vi.fn(() => b());
    const outerFn = vi.fn(() => {
      a();
      createEffect(innerFn);
    });

    createEffect(outerFn);

    expect(outerFn).toHaveBeenCalledTimes(1);
    expect(innerFn).toHaveBeenCalledTimes(1);

    b.set(1);
    await waitForJobs();
    expect(outerFn).toHaveBeenCalledTimes(1);
    expect(innerFn).toHaveBeenCalledTimes(2);

    a.set(1);
    await waitForJobs();
    expect(outerFn).toHaveBeenCalledTimes(2);
    // Inner effect is created again, so it runs once on creation
    expect(innerFn).toHaveBeenCalledTimes(3);
  });

  it('should return a stop function to manually stop the effect', async () => {
    const count = createSignal(0);
    const fn = vi.fn(() => count());

    const effect = createEffect(fn);
    expect(fn).toHaveBeenCalledTimes(1);

    count.set(1);
    await waitForJobs();
    expect(fn).toHaveBeenCalledTimes(2);

    effect.stop();
    count.set(2);
    count.set(3);
    await waitForJobs();

    // Should not have been called again after stopping
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
