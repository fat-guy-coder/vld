import { ReactiveEffect, track, trigger } from './effect';
import type { EqualityFn } from './signal';

/**
 * @description 计算属性的内部实现类。
 * @template T
 * @internal
 */
class ComputedImpl<T> {
  private _value!: T;
  private _dirty = true;
  public readonly effect: ReactiveEffect<T>;
  private readonly observers = new Set<ReactiveEffect>();

  constructor(getter: () => T, private readonly equals: EqualityFn<T> | false) {
    this.effect = new ReactiveEffect(getter, () => {
      // 当依赖项发生变化时，将计算属性标记为“脏”
      if (!this._dirty) {
        this._dirty = true;
        trigger(this.observers);
      }
    });
  }

  /**
   * @description 获取计算属性的值。
   * 如果是“脏”的，则重新计算；否则返回缓存的值。
   */
  get value(): T {
    // 收集依赖于此计算属性的effect
    track(this.observers);

    if (this._dirty) {
      this._dirty = false;
      const newValue = this.effect.run();
      if (this.equals === false ? true : !this.equals(this._value, newValue)) {
        this._value = newValue;
      }
    }
    return this._value;
  }
}

/**
 * @description 创建一个只读的计算属性，其值是根据getter函数动态计算的。
 * @template T
 * @param getter - 用于计算值的函数。
 * @param equals - 可选的自定义相等函数，用于确定值是否已更改。默认为Object.is。
 * @returns 一个包含 `value` 属性的对象，该属性为只读的计算结果。
 * @example
 * const [count, setCount] = createSignal(1);
 * const double = createComputed(() => count() * 2);
 * console.log(double.value); // 2
 * setCount(2);
 * console.log(double.value); // 4
 * @performance 惰性求值，只有在访问时且依赖项已更改时才重新计算。
 * @since v0.1.0
 */
export function createComputed<T>(getter: () => T, equals: EqualityFn<T> | false = Object.is): { readonly value: T } {
  return new ComputedImpl(getter, equals);
}

