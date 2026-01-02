import { track, trigger } from './effect';
import { globalState } from './store';
import type { SignalNode } from './store';
import type { Signal, EqualityFn } from './types';

const BATCH_SIZE = 1000;

/**
 * @internal
 * @description 为对象池分配一批新的 SignalNode。
 */
function allocateBatch(): void {
  const batch: Array<SignalNode<any>> = new Array(BATCH_SIZE);
  for (let i = 0; i < BATCH_SIZE; i++) {
    batch[i] = { value: undefined as any, observers: null, next: null };
  }
  for (let i = 0; i < BATCH_SIZE - 1; i++) {
    batch[i]!.next = batch[i + 1]!;
  }
  globalState.signalNodePool = batch[0]!;
}

/**
 * @internal
 * @description 从全局对象池中获取一个 SignalNode。
 */
function acquireSignalNode<T>(): SignalNode<T> {
  if (globalState.signalNodePool === null) {
    allocateBatch();
  }
  const node = globalState.signalNodePool as SignalNode<T>;
  globalState.signalNodePool = node.next;
  node.next = null;
  return node;
}

/**
 * @description 创建一个可追踪变化的、性能极致的单一函数式 Signal。
 * @param initialValue - 信号的初始值。
 * @param equals - 可选的自定义相等函数。
 * @returns 一个单一函数，既是 getter 也是 setter。
 * @template T - 信号值的类型。
 * @example
 * const count = createSignal(0);
 * console.log(count()); // 读取: 0
 * count(1); // 写入: 1
 * @performance 目标: > 5M ops/sec
 * @since v0.2.0
 */
export function createSignal<T>(initialValue: T, equals: EqualityFn<T> | false = Object.is): Signal<T> {
  const node = acquireSignalNode<T>();
  node.value = initialValue;

  function signal(arg?: T | ((prev: T) => T)): T | void {
    // Getter: 无参数调用
    if (arguments.length === 0) {
      track(node);
      return node.value;
    }

    // Setter: 有参数调用
        // Setter: 有参数调用
    const newValue = typeof arg === 'function'
      ? (arg as (prev: T) => T)(node.value)
      : arg as T;

    const changed = equals === false ? !Object.is(node.value, newValue) : !equals(node.value, newValue as T);
    if (changed) {
      node.value = newValue as T;
      trigger(node);
    }
  }

  // 将 setter 逻辑附加到 signal 函数上，作为 .set 方法
  signal.set = (valueOrUpdater: T | ((prev: T) => T)) => {
    const newValue = typeof valueOrUpdater === 'function'
      ? (valueOrUpdater as (prev: T) => T)(node.value)
      : valueOrUpdater;
    
    const changed = equals === false ? !Object.is(node.value, newValue) : !equals(node.value, newValue as T);
    if (changed) {
      node.value = newValue as T;
      trigger(node);
    }
  };

  return signal as Signal<T>;
}
