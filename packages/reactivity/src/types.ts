/**
 * @description 共享的、用于打破循环依赖的类型定义。
 * @since v0.1.0
 */

/**
 * @description `ReactiveEffect` 的类型声明。
 * 实际的类实现在 `effect.ts` 中。
 * @internal
 */
export declare class ReactiveEffect<T = any> {
  deps: Set<Set<ReactiveEffect<any>>>;
  fn: () => T;
  scheduler: ((effect: ReactiveEffect<T>) => void) | null;

  constructor(fn: () => T, scheduler?: ((effect: ReactiveEffect<T>) => void) | null);
  run(): T;
  stop(): void;
}

