import { describe, it, expect, vi } from 'vitest';
import { createSignal, createEffect, waitForJobs } from '../src';

describe('createSignal', () => {
  it('should return a getter and a setter', () => {
    const [count, setCount] = createSignal(0);
    expect(typeof count).toBe('function');
    expect(typeof setCount).toBe('function');
  });

  it('should set and get the initial value', () => {
    const [count] = createSignal(0);
    expect(count()).toBe(0);
  });

  it('should update the value when the setter is called', () => {
    const [count, setCount] = createSignal(0);
    setCount(10);
    expect(count()).toBe(10);
    setCount(-5);
    expect(count()).toBe(-5);
  });

  it('should not trigger effects if the value is the same (Object.is)', async () => {
    const [count, setCount] = createSignal(0);
    const observer = vi.fn(() => count());
    createEffect(observer);

    expect(observer).toHaveBeenCalledTimes(1); // Initial run
    setCount(0);
    await waitForJobs();
    expect(observer).toHaveBeenCalledTimes(1);
  });

  it('should trigger effects when the value changes', async () => {
    const [count, setCount] = createSignal(0);
    const observer = vi.fn(() => count());
    createEffect(observer);

    expect(observer).toHaveBeenCalledTimes(1); // Initial run
    setCount(1);
    await waitForJobs();
    expect(observer).toHaveBeenCalledTimes(2);
  });

  it('should use a custom equality function and not trigger effects for equal values', async () => {
    const customEquals = (a: { id: number }, b: { id: number }) => a.id === b.id;
    const [item, setItem] = createSignal({ id: 1 }, customEquals);
    const observer = vi.fn(() => item());
    createEffect(observer);

    expect(observer).toHaveBeenCalledTimes(1);
    setItem({ id: 1 }); // Same id, should not trigger effect
    await waitForJobs();
    expect(observer).toHaveBeenCalledTimes(1);

    setItem({ id: 2 }); // Different id, should trigger effect
    await waitForJobs();
    expect(observer).toHaveBeenCalledTimes(2);
  });

  it('should always trigger effects if equals is set to false', async () => {
    const [item, setItem] = createSignal({ id: 1 }, false);
    const observer = vi.fn(() => item());
    createEffect(observer);
    
    expect(observer).toHaveBeenCalledTimes(1);
    setItem({ id: 1 }); // Should trigger effect even if structurally similar
    await waitForJobs();
    expect(observer).toHaveBeenCalledTimes(2);
  });
});
