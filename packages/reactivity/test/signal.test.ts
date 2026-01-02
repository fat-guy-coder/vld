import { describe, it, expect, vi } from 'vitest';
import { createSignal, createEffect, waitForJobs } from '../src';

describe('createSignal', () => {
  it('should return a single function with a .set method', () => {
    const count = createSignal(0);
    expect(typeof count).toBe('function');
    expect(typeof count.set).toBe('function');
  });

  it('should get the initial value', () => {
    const count = createSignal(0);
    expect(count()).toBe(0);
  });

  it('should update the value when called as a setter with a direct value', () => {
    const count = createSignal(0);
    count(10);
    expect(count()).toBe(10);
    count(-5);
    expect(count()).toBe(-5);
  });

  it('should update the value when called as a setter with an updater function', () => {
    const count = createSignal(5);
    count(c => c * 2);
    expect(count()).toBe(10);
  });

  it('should update the value with the .set() method with a direct value', () => {
    const count = createSignal(0);
    count.set(10);
    expect(count()).toBe(10);
    count.set(-5);
    expect(count()).toBe(-5);
  });

  it('should update the value with the .set() method with an updater function', () => {
    const count = createSignal(5);
    count.set(c => c * 2);
    expect(count()).toBe(10);
  });

  it('should not trigger effects if the value is the same (Object.is)', async () => {
    const count = createSignal(0);
    const observer = vi.fn(() => count());
    createEffect(observer);

    expect(observer).toHaveBeenCalledTimes(1); // Initial run
    count.set(0);
    await waitForJobs();
    expect(observer).toHaveBeenCalledTimes(1);
  });

  it('should trigger effects when the value changes', async () => {
    const count = createSignal(0);
    const observer = vi.fn(() => count());
    createEffect(observer);

    expect(observer).toHaveBeenCalledTimes(1); // Initial run
    count.set(1);
    await waitForJobs();
    expect(observer).toHaveBeenCalledTimes(2);
  });

  it('should use a custom equality function and not trigger effects for equal values', async () => {
    const customEquals = (a: { id: number }, b: { id: number }) => a.id === b.id;
    const item = createSignal({ id: 1 }, customEquals);
    const observer = vi.fn(() => item());
    createEffect(observer);

    expect(observer).toHaveBeenCalledTimes(1);
    item.set({ id: 1 }); // Same id, should not trigger effect
    await waitForJobs();
    expect(observer).toHaveBeenCalledTimes(1);

    item.set({ id: 2 }); // Different id, should trigger effect
    await waitForJobs();
    expect(observer).toHaveBeenCalledTimes(2);
  });

  it('should always trigger effects if equals is set to false', async () => {
    const item = createSignal({ id: 1 }, false);
    const observer = vi.fn(() => item());
    createEffect(observer);
    
    expect(observer).toHaveBeenCalledTimes(1);
    item.set({ id: 1 }); // Should trigger effect even if structurally similar
    await waitForJobs();
    expect(observer).toHaveBeenCalledTimes(2);
  });
});
