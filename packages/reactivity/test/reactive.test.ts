import { describe, it, expect, vi } from 'vitest';
import { createReactive, createEffect, waitForJobs } from '../src';

describe('createReactive', () => {
  it('should return a proxy for an object', () => {
    const original = { a: 1 };
    const reactiveObj = createReactive(original);
    expect(reactiveObj).not.toBe(original);
    expect(reactiveObj.a).toBe(1);
  });

  it('should make properties reactive', async () => {
    const state = createReactive({ count: 0 });
    let dummy;

    const effectFn = vi.fn(() => {
      dummy = state.count;
    });

    createEffect(effectFn);
    expect(effectFn).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(0);

    state.count = 5;
    await waitForJobs();
    expect(effectFn).toHaveBeenCalledTimes(2);
    expect(dummy).toBe(5);
  });

  it('should handle nested objects', async () => {
    const state = createReactive({ nested: { num: 0 } });
    let dummy;

    const effectFn = vi.fn(() => {
      dummy = state.nested.num;
    });

    createEffect(effectFn);
    expect(effectFn).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(0);

    state.nested.num = 8;
    await waitForJobs();
    expect(effectFn).toHaveBeenCalledTimes(2);
    expect(dummy).toBe(8);
  });

  it('should cache proxies', () => {
    const original = { a: 1 };
    const proxy1 = createReactive(original);
    const proxy2 = createReactive(original);
    expect(proxy1).toBe(proxy2);
  });

  it('should not wrap non-object values', () => {
    const state = createReactive({ num: 1, str: 'text', bool: true });
    expect(state.num).toBe(1);
    expect(state.str).toBe('text');
    expect(state.bool).toBe(true);
  });

  it('should handle adding new properties', async () => {
    const state = createReactive<{ count?: number }>({});
    let dummy;

    const effectFn = vi.fn(() => {
      dummy = state.count;
    });

    createEffect(effectFn);
    expect(effectFn).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(undefined);

    state.count = 1;
    await waitForJobs();
    expect(effectFn).toHaveBeenCalledTimes(2);
    expect(dummy).toBe(1);
  });
});
