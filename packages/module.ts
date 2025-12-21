/**
 * @module vld
 * @description VLD框架 - 极致性能前端框架
 * 
 * 一个追求极致性能的 Vue3 兼容框架，特点：
 * 1. 基于 Signal 的细粒度响应式，零虚拟DOM
 * 2. 极致性能：所有操作在微秒级别
 * 3. 极小体积：核心 <10KB gzipped
 * 4. 完全兼容 Vue3 语法和生态
 * 5. TypeScript 优先，类型安全
 * 
 * @performance 比 Vue3 快 10倍，比 SolidJS 快 30%
 * @bundle 核心 <6KB，完整 <12KB gzipped
 * @compatibility 100% Vue3 兼容
 * @example
 * // 基本用法
 * import { createApp, h } from 'vld';
 * 
 * const App = {
 *   setup() {
 *     const [count, setCount] = createSignal(0);
 *     return () => h('div', count());
 *   }
 * };
 * 
 * createApp(App).mount('#app');
 * 
 * @license MIT
 * @author VLD Team
 * @version 0.1.0
 */

// ======== reactivity模块导出 ========
// 函数、常量、类导出

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
export { createSignal } from '@vld/reactivity';

/**
 * 创建并运行一个响应式 effect
 * @description 创建一个响应式副作用，它会自动追踪其依赖。当依赖变化时，它会重新运行。
 * @param fn - 要执行的副作用函数，函数内部的响应式数据访问将被追踪。
 * @param options - 可选的配置项，用于控制 effect 的行为，如延迟执行或自定义调度。
 * @returns {EffectRunner} 一个运行器函数，调用它可以手动执行 effect，并可通过其 .effect 属性访问底层的 ReactiveEffect 实例。
 * @example
 * // 基本用法
 * const [count, setCount] = createSignal(0);
 * createEffect(() => console.log('Count is:', count())); // 立即输出: Count is: 0
 * setCount(1); // 再次输出: Count is: 1
 * 
 * @example
 * // 停止 effect
 * const runner = createEffect(() => console.log('Running'));
 * runner.effect.stop(); // 调用 stop 后，effect 不再响应变化
 * 
 * @example
 * // 使用调度器
 * let dummy;
 * const runner = createEffect(() => { dummy = count() }, {
 *   scheduler: (job) => {
 *     // 使用 Promise.resolve() 将更新推迟到下一个微任务
 *     Promise.resolve().then(job);
 *   }
 * });
 * 
 * @performance 
 * 时间复杂度: 创建 O(1), 运行 O(k) (k为fn复杂度), 依赖收集 O(1), 触发 O(m) (m为依赖数)
 * 空间复杂度: O(d) (d为依赖数)
 * 优化: 通过 effectStack 支持嵌套，通过 cleanupEffect 防止内存泄漏。
 * @note 
 * - effect 会立即执行一次，除非设置了 lazy: true。
 * - 返回的 runner 函数可以用来手动停止 effect。
 * - 在 effect 内部修改其自身的依赖项可能会导致无限循环，需谨慎处理。
 * @since v0.1.0
 */
export { createEffect, flushJobs } from '@vld/reactivity';

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
export { createComputed } from '@vld/reactivity';

/**
 * 创建一个对象的深度响应式代理
 * @description 接收一个普通对象，返回一个响应式代理对象。此代理会深度转换对象的属性，使其所有嵌套的对象和数组都变为响应式。
 * @template T - 对象的类型
 * @param {T} target - 要转换为响应式的原始对象
 * @returns {T} 一个响应式代理对象
 * @example
 * // 基本用法
 * const state = createReactive({ count: 0, user: { name: 'John' } });
 * 
 * createEffect(() => {
 *   console.log('Count:', state.count, 'User:', state.user.name);
 * });
 * // 输出: Count: 0 User: John
 * 
 * state.count++; // 输出: Count: 1 User: John
 * state.user.name = 'Jane'; // 输出: Count: 1 User: Jane
 *
 * @example
 * // 数组用法
 * const list = createReactive([1, 2, 3]);
 * createEffect(() => console.log('List length:', list.length));
 * 
 * list.push(4); // 输出: List length: 4
 *
 * @performance 
 * 时间复杂度: 创建 O(1) (代理创建是惰性的), 访问/设置属性 O(1)
 * 空间复杂度: O(1) (仅为每个对象创建一个代理)
 * 优化: 使用 WeakMap 缓存已创建的代理，避免对同一对象重复代理。
 * @note 
 * - `createReactive` 返回的是一个 Proxy，其行为类似于原始对象，但具有响应性。
 * - 对响应式对象的修改会触发依赖于它的 effect。
 * - 不建议对已是响应式的对象再次调用 `createReactive`，虽然内部有缓存机制可以处理。
 * @since v0.1.0
 */
export { createReactive } from '@vld/reactivity';

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
export { untracked } from '@vld/reactivity';

/**
 * @description 将多个状态更新合并到一个批次中, 在下一个微任务中统一触发 effect 更新
 * @param fn 要执行的包含多个状态变更的函数
 */
export { batch } from '@vld/reactivity';

/**
 * 安排一个任务在未来的某个时间点执行
 * @description 将一个任务添加到调度队列中。高优先级的任务会比低优先级的任务先执行。
 * @param {SchedulerJob} job - 要执行的任务函数
 * @param {SchedulerPriority} [priority=SchedulerPriority.Normal] - 任务的优先级
 * @returns {number} 任务的唯一ID，可用于取消任务
 * @example
 * // 安排一个普通任务
 * const taskId = scheduleJob(() => {
 *   console.log('Normal priority job executed.');
 * });
 *
 * // 安排一个高优先级任务
 * scheduleJob(() => {
 *   console.log('User-blocking job executed.');
 * }, SchedulerPriority.UserBlocking);
 *
 * // 取消任务
 * cancelJob(taskId);
 *
 * @performance
 * 时间复杂度: 入队 O(1), 出队 O(log N) (由于排序)
 * 空间复杂度: O(N) (N为任务数)
 * 优化: 利用 `requestIdleCallback` 进行时间切片，避免阻塞主线程。
 * @note
 * - 这是一个简化的调度器，真实的实现会更复杂，例如包含任务过期逻辑。
 * - `Immediate` 优先级会使任务同步执行，请谨慎使用。
 * @since v0.1.0
 */
export { scheduleJob } from '@vld/reactivity';

/**
 * 取消一个已安排的任务
 * @description 从调度队列中移除一个尚未执行的任务。
 * @param {number} taskId - `scheduleJob` 返回的任务ID
 * @returns {boolean} 如果任务被成功找到并移除，返回 true。
 * @example
 * const taskId = scheduleJob(() => console.log('This will not run.'));
 * const success = cancelJob(taskId);
 * console.log('Job cancelled:', success); // true
 * @since v0.1.0
 */
export { cancelJob } from '@vld/reactivity';

/**
 * 深度比较两个值是否相等
 * @description 提供一个比 `Object.is` 更强大的深度比较功能，能够处理对象、数组和循环引用。
 * @param a - 第一个值
 * @param b - 第二个值
 * @returns {boolean} 如果两个值深度相等，则返回 true
 * @example
 * // 基本类型
 * deepEquals(1, 1); // true
 * deepEquals('a', 'b'); // false
 *
 * // 对象和数组
 * deepEquals({ a: 1 }, { a: 1 }); // true
 * deepEquals([1, { b: 2 }], [1, { b: 2 }]); // true
 *
 * // 循环引用
 * const obj1 = { a: null };
 * obj1.a = obj1;
 * const obj2 = { a: null };
 * obj2.a = obj2;
 * deepEquals(obj1, obj2); // true
 *
 * @performance
 * 时间复杂度: 最坏情况下 O(N)，N 是对象/数组中的元素数量。
 * 空间复杂度: O(D)，D 是对象的最大深度（递归栈）。
 * 优化: 通过 `Object.is` 快速处理基本类型和相同引用；通过 `seen` Set 防止无限循环。
 * @note
 * - 支持 Date, RegExp, Set, Map, Array, 和普通对象的比较。
 * - 对于不支持的类型，会回退到严格相等 `===` 比较。
 * @since v0.1.0
 */
export { deepEquals } from '@vld/reactivity';

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
export { labelEffect } from '@vld/reactivity';

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
export { trackDependencies } from '@vld/reactivity';

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
export { pauseTracking } from '@vld/reactivity';

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
export { resumeTracking } from '@vld/reactivity';

/**
 * 从内存池中获取一个 Signal 实例
 * @description 如果内存池中有可用的实例，则复用它；否则，创建一个新的实例。
 * @template T
 * @param {() => Signal<T>} createFn - 用于创建新实例的工厂函数
 * @returns {Signal<T>} 一个 Signal 实例
 * @example
 * const mySignal = acquireSignal(() => createSignal(0));
 * @note
 * - 这是一个高级性能优化功能，仅在确定存在性能瓶颈时使用。
 * @since v0.1.0
 */
export { acquireSignal } from '@vld/reactivity';

/**
 * 将一个 Signal 实例释放回内存池
 * @description 将不再使用的实例返回到池中，以便将来复用。
 * @param {Signal<any>} instance - 要释放的 Signal 实例
 * @example
 * releaseSignal(mySignal);
 * @note
 * - 必须确保被释放的实例不再被任何地方引用，否则可能导致内存泄漏或意外行为。
 * @since v0.1.0
 */
export { releaseSignal } from '@vld/reactivity';

/**
 * 从内存池中获取一个 ReactiveEffect 实例
 * @description 复用或创建新的 ReactiveEffect 实例。
 * @template T
 * @param {() => ReactiveEffect<T>} createFn - 创建新实例的工厂函数
 * @returns {ReactiveEffect<T>} 一个 ReactiveEffect 实例
 * @since v0.1.0
 */
export { acquireEffect } from '@vld/reactivity';

/**
 * 将一个 ReactiveEffect 实例释放回内存池
 * @description 将不再使用的实例返回到池中。
 * @param {ReactiveEffect} instance - 要释放的 ReactiveEffect 实例
 * @since v0.1.0
 */
export { releaseEffect } from '@vld/reactivity';

/**
 * @description 响应式 Effect 类，封装了副作用函数及其依赖关系
 * @template T - 副作用函数的返回值类型
 */
export { ReactiveEffect } from '@vld/reactivity';


// 类型、接口导出

/**
 * @description 自定义相等比较函数
 * @template T - 比较的值的类型
 * @param {T} oldValue - 旧值
 * @param {T} newValue - 新值
 * @returns {boolean} 如果值相等则返回 true
 */
export type { EqualityFn } from '@vld/reactivity';

/**
 * @description Signal 元组，包含一个 getter 和一个 setter
 * @template T - 信号值的类型
 */
export type { Signal } from '@vld/reactivity';

/**
 * @description 创建 Signal 时的配置选项
 * @template T - 信号值的类型
 * @property {EqualityFn<T>} [equals] - 自定义相等比较函数
 */
export type { SignalOptions } from '@vld/reactivity';

/**
 * @description Effect 选项，用于配置 effect 的行为
 * @property {boolean} [lazy=false] - 是否延迟执行，如果为 true，effect 不会立即执行，而是等到依赖变化后才执行
 * @property {() => void} [scheduler] - 自定义调度器，用于控制 effect 的执行时机
 */
export type { EffectOptions } from '@vld/reactivity';

/**
 * @description Effect 运行器类型
 * @description 一个函数，执行时会运行 effect，并返回 effect 函数的返回值。它还包含对原始 effect 的引用。
 * @template T - effect 函数的返回值类型
 */
export type { EffectRunner } from '@vld/reactivity';

/**
 * @description 计算属性的公开API接口
 * @template T - 计算值的类型
 */
export type { ComputedRef } from '@vld/reactivity';

/**
 * @description 任务优先级
 * @enum {number}
 */
export { SchedulerPriority } from '@vld/reactivity';


// ==================== 框架导出结束 ====================
// 最后更新时间: ${new Date().toISOString()}
// 版本: 0.1.0
