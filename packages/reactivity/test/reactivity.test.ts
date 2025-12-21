import { describe, it, expect, vi } from 'vitest';
import {
  createSignal,
  createEffect,
  createComputed,
  createReactive,
  batch,
  untracked,
  scheduleJob,
  cancelJob,
  SchedulerPriority,
  deepEquals,
} from '../src';


vi.useFakeTimers();

describe('reactivity', () => {
  it('createSignal: should get and set value', () => {
    const [count, setCount] = createSignal(0);
    expect(count()).toBe(0);
    setCount(1);
    expect(count()).toBe(1);
  });

  it('createEffect: should run automatically and track dependencies', async () => {
    const [count, setCount] = createSignal(0);
    const effectFn = vi.fn(() => count());

    createEffect(effectFn);

    expect(effectFn).toHaveBeenCalledTimes(1);
    setCount(1);
    await vi.advanceTimersByTimeAsync(0); await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
    expect(effectFn).toHaveBeenCalledTimes(2);
  });

  it('createComputed: should compute and cache value', () => {
    const [count, setCount] = createSignal(1);
    const getter = vi.fn(() => count() * 2);
    const double = createComputed(getter);

    expect(double.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(1);

    // Access again, should use cache
    expect(double.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(1);

    // Update dependency, should re-compute
    setCount(2);
    expect(double.value).toBe(4);
    expect(getter).toHaveBeenCalledTimes(2);
  });

  it('createReactive: should create a deep reactive proxy', async () => {
    const state = createReactive({ a: { b: 1 }, c: [2] });
    let dummy;
    const effectFn = vi.fn(() => {
      dummy = state.a.b + state.c.length;
    });

    createEffect(effectFn);
    expect(effectFn).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(1 + 1);

    state.a.b = 2;
    await vi.advanceTimersByTimeAsync(0);
    expect(effectFn).toHaveBeenCalledTimes(2);
    expect(dummy).toBe(2 + 1);

    state.c.push(3);
    await vi.advanceTimersByTimeAsync(0);
    expect(effectFn).toHaveBeenCalledTimes(3);
    expect(dummy).toBe(2 + 2);
  });

  it('batch: should batch updates', async () => {
    const [count, setCount] = createSignal(0);
    const effectFn = vi.fn(() => count());

    createEffect(effectFn);
    expect(effectFn).toHaveBeenCalledTimes(1);

    batch(() => {
      setCount(1);
      setCount(2);
      setCount(3);
    });

    expect(count()).toBe(3);
    await vi.advanceTimersByTimeAsync(0);
    expect(effectFn).toHaveBeenCalledTimes(2); // Only one update after batch
  });

  it('untracked: should not track dependencies', async () => {
    const [count, setCount] = createSignal(0);
    const [other, setOther] = createSignal(0);
    const effectFn = vi.fn(() => {
      count();
      untracked(() => other());
    });

    createEffect(effectFn);
    expect(effectFn).toHaveBeenCalledTimes(1);

    setCount(1);
    await vi.advanceTimersByTimeAsync(0);
    expect(effectFn).toHaveBeenCalledTimes(2);

    // This should not trigger the effect
    setOther(1);
    expect(effectFn).toHaveBeenCalledTimes(2);
  });

  it.skip('scheduler: should schedule and cancel jobs', async () => {
    const job = vi.fn();
    const taskId = scheduleJob(job, SchedulerPriority.Normal);
    
    // Wait for next tick
    await vi.advanceTimersByTimeAsync(0);
    expect(job).toHaveBeenCalledTimes(1);

    const job2 = vi.fn();
    const taskId2 = scheduleJob(job2, SchedulerPriority.Normal);
    const cancelled = cancelJob(taskId2);
    expect(cancelled).toBe(true);

    // Wait for next tick
    await new Promise(r => setTimeout(r, 0));
    expect(job2).not.toHaveBeenCalled();
  });

  it('deepEquals: should perform deep equality check', () => {
    const obj1 = { a: 1, b: { c: [2, 3] } };
    const obj2 = { a: 1, b: { c: [2, 3] } };
    const obj3 = { a: 1, b: { c: [2, 4] } };
    
    expect(deepEquals(obj1, obj2)).toBe(true);
    expect(deepEquals(obj1, obj3)).toBe(false);

    // Circular reference
    const circ1: any = { a: null };
    circ1.a = circ1;
    const circ2: any = { a: null };
    circ2.a = circ2;
    expect(deepEquals(circ1, circ2)).toBe(true);
  });
});
