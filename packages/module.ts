// ==================================================================================================
// LD 框架主入口 (LD Framework Main Entry)
// ==================================================================================================
// 此文件是 LD 框架的唯一公共 API 出口。
// 所有模块的公共 API 都应在此处重新导出，以供用户或其他模块使用。

// --------------------------------------------------------------------------------------------------
// 响应式模块 (@ld/reactivity)
// --------------------------------------------------------------------------------------------------

/**
 * @description 创建一个可追踪变化的、性能极致的单一函数式 Signal。
 * @since v0.2.0
 */
export { createSignal } from '@ld/reactivity'

/**
 * @description 创建一个副作用，当其依赖的 Signal 变化时会自动重新运行。
 * @since v0.1.0
 */
export { createEffect } from '@ld/reactivity'

/**
 * @description 创建一个只读的计算属性。
 * @since v0.1.0
 */
export { createComputed } from '@ld/reactivity'

/**
 * @description 为一个对象创建一个深层响应式代理。
 * @since v0.1.0
 */
export { createReactive } from '@ld/reactivity'

/**
 * @description 将多个状态变更组合成一个“批处理”，在所有变更完成后只触发一次 effect 更新。
 * @since v0.1.0
 */
export { batch } from '@ld/reactivity'

/**
 * @description (底层API) 手动追踪一个依赖。
 * @since v0.2.1
 */
export { track } from '@ld/reactivity'

/**
 * @description (底层API) 手动触发一个依赖的更新。
 * @since v0.2.1
 */
export { trigger } from '@ld/reactivity'

/**
 * @description (底层API) 获取当前正在运行的 effect。
 * @since v0.1.0
 */
export { getActiveEffect } from '@ld/reactivity'

/**
 * @description (底层API) effect 的内部表示类。
 * @since v0.1.0
 */
export { ReactiveEffect } from '@ld/reactivity'

/**
 * @description (底层API) 将一个 effect 加入调度队列。
 * @since v0.1.0
 */
export { queueJob } from '@ld/reactivity'

/**
 * @description (底层API) 等待所有调度任务完成。
 * @since v0.1.0
 */
export { waitForJobs } from '@ld/reactivity'

/**
 * @description (底层API) 框架的内部全局状态存储。
 * @since v0.1.0
 */
export { globalState } from '@ld/reactivity'

/**
 * @description (底层API) 创建一个实例范围的状态存储。
 * @since v0.1.0
 */
export { createInstanceStore } from '@ld/reactivity'

// --- Types ---
export type { Signal, EqualityFn, EffectOptions } from '@ld/reactivity'

// --------------------------------------------------------------------------------------------------
// 运行时核心模块 (@ld/runtime-core)
// --------------------------------------------------------------------------------------------------

/**
 * @description 创建一个平台无关的核心渲染器。
 * @since v0.1.0
 */
export { createRenderer } from '@ld/runtime-core'

/**
 * @description 平台相关的渲染器选项。
 * @since v0.1.0
 */
export type { RendererOptions } from '@ld/runtime-core'

/**
 * @description 注册一个在组件挂载后调用的回调函数。
 * @since v0.1.0
 */
export { onMount } from '@ld/runtime-core'

/**
 * @description 注册一个在组件更新后调用的回调函数。
 * @since v0.1.0
 */
export { onUpdate } from '@ld/runtime-core'

/**
 * @description 注册一个在组件卸载前调用的回调函数。
 * @since v0.1.0
 */
export { onUnmount } from '@ld/runtime-core'
