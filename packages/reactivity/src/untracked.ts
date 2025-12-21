import { activeEffect, setActiveEffect } from './effect';

/**
 * 在一个代码块中临时禁用依赖追踪
 * @description 执行一个函数，但阻止该函数内部对响应式数据的读取操作被当前的 effect 追踪。
 * @template T - 函数的返回值类型
 * @param {() => T} fn - 要在无追踪环境下执行的函数
 * @returns {T} 返回传入函数的执行结果
 * @example
 * const [count, setCount] = createSignal(0);
 * const [double, setDouble] = createSignal(0);
 *
 * createEffect(() => {
 *   // 这里会建立对 count 的依赖
 *   const currentCount = count();
 *
 *   // 使用 untracked 来读取 double 的值，但不会建立对 double 的依赖
 *   untracked(() => {
 *     console.log('Double is (untracked):', double());
 *   });
 * });
 *
 * setCount(1); // 会触发 effect
 * setDouble(1); // 不会触发 effect
 *
 * @performance
 * 时间复杂度: O(k) (k为fn的复杂度)
 * 空间复杂度: O(1)
 * 优化: 零开销，仅涉及一个变量的临时修改。
 * @note
 * - `untracked` 主要用于在 effect 中需要读取某些响应式数据，但又不希望在这些数据变化时重新触发该 effect 的场景。
 * - 它可以嵌套使用，效果是可叠加的。
 * @since v0.1.0
 */
export function untracked<T>(fn: () => T): T {
  const prevEffect = activeEffect;
  setActiveEffect(undefined);
  try {
    return fn();
  } finally {
    setActiveEffect(prevEffect);
  }
}

