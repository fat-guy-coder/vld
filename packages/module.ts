// ==================================================================================================
// LD 框架主入口 (LD Framework Main Entry)
// ==================================================================================================
// 此文件是 LD 框架的唯一公共 API 出口。
// 所有模块的公共 API 都应在此处重新导出，以供用户或其他模块使用。

// --------------------------------------------------------------------------------------------------
// 响应式模块 (@ld/reactivity)
// --------------------------------------------------------------------------------------------------

/**
 * @description 创建一个可追踪变化的响应式值容器（Signal）。
 * @since v0.1.0
 */
export { createSignal } from '@ld/reactivity';

/**
 * @description Signal的类型定义，包含一个读取器和一个写入器。
 * @since v0.1.0
 */
export type { Signal, EqualityFn } from '@ld/reactivity';

/**
 * @description 创建一个副作用，当其依赖的 Signal 变化时会自动重新运行。
 * @since v0.1.0
 */
export { createEffect } from '@ld/reactivity';

/**
 * @description 一个响应式Effect的内部表示。
 * @since v0.1.0
 */
export type { EffectOptions, ReactiveEffect } from '@ld/reactivity';

/**
 * @description 创建一个只读的计算属性。
 * @since v0.1.0
 */
export { createComputed } from '@ld/reactivity';

/**
 * @description 为一个对象创建一个深层响应式代理。
 * @since v0.1.0
 */
export { createReactive } from '@ld/reactivity';

/**
 * @description 将多个状态变更组合成一个“批处理”，在所有变更完成后只触发一次 effect 更新。
 * @since v0.1.0
 */
export { batch } from '@ld/reactivity';

// --------------------------------------------------------------------------------------------------
// 运行时核心模块 (@ld/runtime-core)
// --------------------------------------------------------------------------------------------------

/**
 * @description 创建一个平台无关的核心渲染器。
 * @since v0.1.0
 */
export { createRenderer } from '@ld/runtime-core';

/**
 * @description 平台相关的渲染器选项。
 * @since v0.1.0
 */
export type { RendererOptions } from '@ld/runtime-core';

/**
 * @description 注册一个在组件挂载后调用的回调函数。
 * @since v0.1.0
 */
export { onMount } from '@ld/runtime-core';

/**
 * @description 注册一个在组件更新后调用的回调函数。
 * @since v0.1.0
 */
export { onUpdate } from '@ld/runtime-core';

/**
 * @description 注册一个在组件卸载前调用的回调函数。
 * @since v0.1.0
 */
export { onUnmount } from '@ld/runtime-core';

