import { describe, it, expect, vi } from 'vitest';
import { createSignal } from '../src/signal';
import { createEffect } from '../src/effect';
import { batch } from '../src/batch';

describe('batch', () => {
  it('should batch multiple signal updates into a single effect run', () => {
    const [firstName, setFirstName] = createSignal('John');
    const [lastName, setLastName] = createSignal('Doe');
    const spy = vi.fn(() => {
      // 在 effect 中访问信号以建立依赖
      firstName();
      lastName();
    });

    createEffect(spy);

    // 初始执行
    expect(spy).toHaveBeenCalledTimes(1);

    batch(() => {
      setFirstName('Jane');
      expect(spy).toHaveBeenCalledTimes(1); // 在 batch 内部，effect 不应被触发
      setLastName('Smith');
      expect(spy).toHaveBeenCalledTimes(1); // 仍然不应被触发
    });

    // 在 batch 结束后，effect 应该只额外执行一次
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should handle nested batch calls correctly', () => {
    const [name, setName] = createSignal('A');
    const [age, setAge] = createSignal(10);
    const spy = vi.fn(() => {
      name();
      age();
    });

    createEffect(spy);

    expect(spy).toHaveBeenCalledTimes(1);

    batch(() => {
      setName('B');
      expect(spy).toHaveBeenCalledTimes(1);

      batch(() => {
        setAge(20);
        expect(spy).toHaveBeenCalledTimes(1); // 在嵌套 batch 中也不应触发
      });

      expect(spy).toHaveBeenCalledTimes(1); // 嵌套 batch 结束后，仍然不应触发
    });

    // 只有在最外层的 batch 结束后，effect 才应执行
    expect(spy).toHaveBeenCalledTimes(2);
    });

  it('should not trigger effects if batch is empty', () => {
    const [count, setCount] = createSignal(0);
    const spy = vi.fn(() => count());

    createEffect(spy);

    expect(spy).toHaveBeenCalledTimes(1);

    batch(() => {
      // 空的 batch
    });

    expect(spy).toHaveBeenCalledTimes(1); // 不应有额外的 effect 执行
  });

  it('should flush jobs correctly after batching', () => {
    const [count, setCount] = createSignal(0);
    const spy = vi.fn(() => count());

    createEffect(spy);

    expect(spy).toHaveBeenCalledTimes(1);

    setCount(1); // 正常更新，触发 effect
    expect(spy).toHaveBeenCalledTimes(2);

    batch(() => {
      setCount(10);
      setCount(20);
    });

    expect(spy).toHaveBeenCalledTimes(3); // batch 结束后触发一次
    expect(count()).toBe(20);
  });
});
