import type { ReactiveEffect } from './effect';

/**
 * @description VLD 框架的内部全局状态存储。
 * @internal
 */
export const globalState = {
  /**
   * @description 用于批量处理的 effect 队列。
   */
  queue: new Set<ReactiveEffect>(),

  /**
   * @description 用于缓存已创建的响应式代理的 WeakMap。
   */
  reactiveMap: new WeakMap<object, any>(),

  /**
   * @description 调度器是否正在刷新队列的标志。
   */
  isFlushing: false,

  /**
   * @description 当前是否处于批量更新模式的标志。
   */
  isBatching: false,
};

/**
 * @description 创建一个实例范围的状态存储。注意：此功能是为未来的组件实例作用域状态预留的，当前响应式系统主要使用全局状态。
 * @internal
 */
export function createInstanceStore() {
  return {
    // 以后可以在这里添加与特定组件实例相关的状态
  };
}
