import { Signal } from '../signal';
import { ReactiveEffect } from '../effect';
import { ComputedRef } from '../computed';

// ==================== 类型定义 ====================

type PoolableInstance = Signal<any> | ReactiveEffect | ComputedRef<any>;

// ==================== 核心实现 ====================

const signalPool: Signal<any>[] = [];
const effectPool: ReactiveEffect[] = [];
const computedPool: ComputedRef<any>[] = [];

const MAX_POOL_SIZE = 100;

// ==================== API ====================

/**
 * 从内存池中获取一个 Signal 实例
 * @description 如果内存池中有可用的实例，则复用它；否则，创建一个新的实例。
 * @template T
 * @param {() => T} createFn - 用于创建新实例的工厂函数
 * @returns {Signal<T>} 一个 Signal 实例
 * @example
 * const mySignal = acquireSignal(() => createSignal(0));
 * @note
 * - 这是一个高级性能优化功能，仅在确定存在性能瓶颈时使用。
 * @since v0.1.0
 */
export function acquireSignal<T>(createFn: () => Signal<T>): Signal<T> {
  if (signalPool.length > 0) {
    return signalPool.pop() as Signal<T>;
  }
  return createFn();
}

/**
 * 将一个 Signal 实例释放回内存池
 * @description 将不再使用的实例返回到池中，以便将来复用。
 * @param {Signal<any>} instance - 要释放的 Signal 实例
 * @example
 * releaseSignal(mySignal);
 * @note
 * - 必须确保被释放的实例不再被任何地方引用，否则可能导致内存泄漏或意外行为。
 * @since v0.1.0
 */
export function releaseSignal(instance: Signal<any>) {
  if (signalPool.length < MAX_POOL_SIZE) {
    // 在放回池中之前，可能需要重置实例的状态
    signalPool.push(instance);
  }
}

/**
 * 从内存池中获取一个 ReactiveEffect 实例
 * @description 复用或创建新的 ReactiveEffect 实例。
 * @template T
 * @param {() => ReactiveEffect<T>} createFn - 创建新实例的工厂函数
 * @returns {ReactiveEffect<T>} 一个 ReactiveEffect 实例
 * @since v0.1.0
 */
export function acquireEffect<T>(createFn: () => ReactiveEffect<T>): ReactiveEffect<T> {
  if (effectPool.length > 0) {
    return effectPool.pop() as ReactiveEffect<T>;
  }
  return createFn();
}

/**
 * 将一个 ReactiveEffect 实例释放回内存池
 * @description 将不再使用的实例返回到池中。
 * @param {ReactiveEffect} instance - 要释放的 ReactiveEffect 实例
 * @since v0.1.0
 */
export function releaseEffect(instance: ReactiveEffect) {
  if (effectPool.length < MAX_POOL_SIZE) {
    instance.stop(); // 确保 effect 被清理
    effectPool.push(instance);
  }
}

