import { trigger, activeEffect, trackEffects, triggerEffects } from './effect';

// ==================== 类型定义 ====================

/**
 * @description 自定义相等比较函数
 * @template T - 比较的值的类型
 * @param {T} oldValue - 旧值
 * @param {T} newValue - 新值
 * @returns {boolean} 如果值相等则返回 true
 */
export type EqualityFn<T> = (oldValue: T, newValue: T) => boolean;

/**
 * @description Signal 的读取器 (getter)
 * @template T - 信号值的类型
 * @returns {T} 当前信号值
 */
export type SignalGetter<T> = () => T;

/**
 * @description Signal 的写入器 (setter)
 * @template T - 信号值的类型
 * @param {T} newValue - 新的信号值
 * @returns {void}
 */
export type SignalSetter<T> = (newValue: T) => void;

/**
 * @description Signal 元组，包含一个 getter 和一个 setter
 * @template T - 信号值的类型
 */
export type Signal<T> = [SignalGetter<T>, SignalSetter<T>];

/**
 * @description 创建 Signal 时的配置选项
 * @template T - 信号值的类型
 * @property {EqualityFn<T>} [equals] - 自定义相等比较函数
 */
export interface SignalOptions<T> {
  equals?: EqualityFn<T>;
}

// ==================== 核心实现 ====================

const VALUE = Symbol('value');
const SUBSCRIBERS = Symbol('subscribers');

class SignalImpl<T> {
  private [VALUE]: T;
  private [SUBSCRIBERS] = new Set<any>();
  private equals: EqualityFn<T>;

  constructor(initialValue: T, equals?: EqualityFn<T>) {
    this[VALUE] = initialValue;
    this.equals = equals || Object.is;
  }

  get value(): T {
    this.track();
    return this[VALUE];
  }

  set value(newValue: T) {
    if (!this.equals(this[VALUE], newValue)) {
      this[VALUE] = newValue;
      this.trigger();
    }
  }

  track() {
    if (activeEffect) {
      trackEffects(this[SUBSCRIBERS]);
    }
  }

  trigger() {
    triggerEffects(this[SUBSCRIBERS]);
  }
}

// ==================== API ====================

/**
 * 创建一个响应式信号
 * @description 创建一个可追踪变化的响应式值容器。返回一个包含 getter 和 setter 的元组。
 * @template T - 信号值的类型
 * @param {T} initialValue - 信号的初始值
 * @param {SignalOptions<T>} [options] - 可选的配置项，例如自定义相等函数
 * @returns {Signal<T>} 一个元组 `[getter, setter]`
 * @example
 * // 基本用法
 * const [count, setCount] = createSignal(0);
 * console.log(count()); // 0
 * setCount(1);
 * console.log(count()); // 1
 *
 * @example
 * // 自定义相等函数
 * const [user, setUser] = createSignal({ id: 1 }, { 
 *   equals: (a, b) => a.id === b.id 
 * });
 * // 当 id 相同时，即使对象引用不同，也不会触发更新
 * setUser({ id: 1 }); 
 *
 * @performance 
 * 时间复杂度: 创建 O(1), 读取 O(1), 设置 O(m) (m为依赖数)
 * 空间复杂度: O(d) (d为依赖数)
 * 优化: 使用 Symbol 隐藏内部属性，避免外部意外访问。
 * @note 
 * - Getter (`count()`) 用于读取值并进行依赖追踪。
 * - Setter (`setCount(1)`) 用于更新值并触发依赖更新。
 * - 默认使用 `Object.is` 进行相等性比较。
 * @since v0.1.0
 */
export function createSignal<T>(initialValue: T, options?: SignalOptions<T>): Signal<T> {
  const signal = new SignalImpl(initialValue, options?.equals);

  const getter = () => signal.value;
  const setter = (newValue: T) => {
    signal.value = newValue;
  };

  return [getter, setter];
}

