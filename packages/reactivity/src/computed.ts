import { ReactiveEffect, trackEffects, triggerEffects } from './effect';


// ==================== 类型定义 ====================

/**
 * @description 计算属性的公开API接口
 * @template T - 计算值的类型
 */
export interface ComputedRef<T = any> {
  /**
   * 计算属性的 effect 实例
   */
  readonly effect: ReactiveEffect<T>;
  /**
   * 计算属性的值
   */
  readonly value: T;
}

// ==================== 核心实现 ====================

class ComputedRefImpl<T> {
  private _value!: T;
  private _dirty = true;
  public readonly effect: ReactiveEffect<T>;
  private readonly __v_isRef = true; // for Vue 3 compatibility
  private readonly __v_isReadonly = true; // for Vue 3 compatibility

  private subscribers = new Set<ReactiveEffect>();

  constructor(getter: () => T) {
    this.effect = new ReactiveEffect(getter, () => {
      // 调度器：当依赖变化时，将 computed 标记为“脏”并触发其订阅者
      if (!this._dirty) {
        this._dirty = true;
        triggerEffects(this.subscribers);
      }
    });
  }

  get value(): T {
    // 追踪依赖：当读取 .value 时，收集当前正在运行的 effect
    trackEffects(this.subscribers);

    // 惰性求值：只有在“脏”状态时才重新计算
    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run();
    }
    return this._value;
  }
}

// ==================== API ====================

/**
 * 创建一个惰性求值的计算属性
 * @description 创建一个响应式的、可缓存的计算属性。它会根据其依赖自动更新，但只有在被访问时才重新计算（惰性求值）。
 * @template T - 计算值的类型
 * @param {() => T} getter - 用于计算值的函数。此函数内部的响应式数据访问将被追踪。
 * @returns {ComputedRef<T>} 一个只读的响应式引用，其 .value 属性为计算结果。
 * @example
 * // 基本用法
 * const [count, setCount] = createSignal(1);
 * const double = createComputed(() => count() * 2);
 * 
 * console.log(double.value); // 2
 * 
 * setCount(2);
 * console.log(double.value); // 4
 *
 * @example
 * // 惰性求值
 * const [firstName, setFirstName] = createSignal('John');
 * const [lastName, setLastName] = createSignal('Doe');
 * const fullName = createComputed(() => `${firstName()} ${lastName()}`);
 * // `fullName` 的 getter 函数此时不会执行
 * 
 * createEffect(() => {
 *   console.log('Full name is:', fullName.value); // 第一次访问，触发计算
 * });
 * // 输出: Full name is: John Doe
 * 
 * setFirstName('Jane');
 * // 输出: Full name is: Jane Doe
 *
 * @performance 
 * 时间复杂度: 创建 O(1), 读取(缓存命中) O(1), 读取(缓存未命中) O(k) (k为getter复杂度), 依赖更新 O(m) (m为依赖数)
 * 空间复杂度: O(d) (d为依赖数)
 * 优化: 通过 `_dirty` 标记实现缓存，避免不必要的重复计算。
 * @note 
 * - `createComputed` 返回的是一个只读对象，不能直接修改其 `.value`。
 * - 计算属性的 `getter` 函数应尽可能纯净，避免产生副作用。
 * - 如果在 `getter` 中形成了循环依赖（例如，A 依赖 B，B 又依赖 A），将导致无限递归错误。
 * @since v0.1.0
 */
export function createComputed<T>(getter: () => T): ComputedRef<T> {
  return new ComputedRefImpl(getter) as ComputedRef<T>;
}

