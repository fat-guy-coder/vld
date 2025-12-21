import { ReactiveEffect } from '../effect';

// ==================== 全局状态 ====================

// 通过一个全局变量或环境变量来控制开发模式
// 在实际构建中，构建工具会替换这个值为 false
const __DEV__ = process.env.NODE_ENV !== 'production';

let activeEffect: ReactiveEffect | undefined;

// ==================== API ====================

/**
 * (开发模式专用) 为一个 effect 设置调试标签
 * @description 在开发模式下，为一个 effect 附加一个名称，便于在调试工具中识别。
 * @param {ReactiveEffect} effect - 要标记的 effect 实例
 * @param {string} label - 调试标签
 * @example
 * const runner = createEffect(() => { ... });
 * // 在开发工具中，这个 effect 将被标记为 'MyComponent Update'
 * labelEffect(runner.effect, 'MyComponent Update');
 * @note
 * - 此函数在生产环境中为空操作，会被 tree-shaking 移除。
 * @since v0.1.0
 */
export function labelEffect(effect: ReactiveEffect, label: string) {
  if (__DEV__) {
    (effect as any).label = label;
  }
}

/**
 * (开发模式专用) 追踪一个 effect 的依赖
 * @description 在开发模式下，返回一个 effect 当前依赖的所有响应式源的列表。
 * @param {ReactiveEffect} effect - 要追踪的 effect 实例
 * @returns {any[]} 一个包含所有依赖源的数组
 * @example
 * const [count, setCount] = createSignal(0);
 * const runner = createEffect(() => console.log(count()));
 * 
 * // 返回一个数组，其中包含 count 的内部 signal 实现
 * const deps = trackDependencies(runner.effect);
 * @note
 * - 此函数在生产环境中返回一个空数组。
 * @since v0.1.0
 */
export function trackDependencies(effect: ReactiveEffect): any[] {
  if (__DEV__) {
    // 这里的实现依赖于 effect 内部如何存储其依赖
    // 假设 effect.deps 是一个 Set 数组
    return (effect as any).deps || [];
  }
  return [];
}

/**
 * (开发模式专用) 暂停依赖追踪
 * @description 在开发模式下，临时全局暂停所有依赖追踪。
 * @example
 * pauseTracking();
 * // 在此期间，所有响应式数据的读取都不会被收集依赖
 * resumeTracking();
 * @note
 * - 此函数在生产环境中为空操作。
 * @since v0.1.0
 */
export function pauseTracking() {
  if (__DEV__) {
    activeEffect = (globalThis as any).__v_activeEffect;
    (globalThis as any).__v_activeEffect = undefined;
  }
}

/**
 * (开发模式专用) 恢复依赖追踪
 * @description 在开发模式下，恢复之前被暂停的依赖追踪。
 * @example
 * pauseTracking();
 * // ...
 * resumeTracking();
 * @note
 * - 此函数在生产环境中为空操作。
 * @since v0.1.0
 */
export function resumeTracking() {
  if (__DEV__ && activeEffect) {
    (globalThis as any).__v_activeEffect = activeEffect;
    activeEffect = undefined;
  }
}

