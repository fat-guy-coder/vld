import type { ReactiveEffect } from './effect';

/**
 * @description 单一函数式 Signal 的类型定义。
 *  - 调用无参数时作为 Getter 返回当前值。
 *  - 调用带参数时作为 Setter 写入新值。
 *  - 额外暴露 .set 方法以避免写入时的多余读取开销。
 * @template T - 信号值类型。
 */
export interface Signal<T> {
  (): T; // Getter
  (newValue: T): void; // Setter (direct value)
  (updater: (prev: T) => T): void; // Setter (updater function)

  /**
   * @description 高效写入辅助，避免 setter 需要先读取再写入的额外开销。
   * @example
   * count.set(1);
   * count.set(v => v + 1);
   */
  set: (valueOrUpdater: T | ((prev: T) => T)) => void;
}

/**
 * @description 比较两个值是否相等的函数类型。
 */
export type EqualityFn<T> = (a: T, b: T) => boolean;

export type { ReactiveEffect };
