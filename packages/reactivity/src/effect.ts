// ==================== 类型定义 ====================

/**
 * @description Effect 选项，用于配置 effect 的行为
 * @property {boolean} [lazy=false] - 是否延迟执行，如果为 true，effect 不会立即执行，而是等到依赖变化后才执行
 * @property {() => void} [scheduler] - 自定义调度器，用于控制 effect 的执行时机
 */
export interface EffectOptions {
  lazy?: boolean;
  scheduler?: (job: EffectRunner) => void;
}

/**
 * @description Effect 运行器类型
 * @description 一个函数，执行时会运行 effect，并返回 effect 函数的返回值。它还包含对原始 effect 的引用。
 * @template T - effect 函数的返回值类型
 */
export interface EffectRunner<T = any> {
  (): T;
  effect: ReactiveEffect;
}

// ==================== 核心实现 ====================

/**
 * @description 响应式 Effect 类，封装了副作用函数及其依赖关系
 * @template T - 副作用函数的返回值类型
 */
export class ReactiveEffect<T = any> {
  /**
   * 副作用函数
   * @private
   */
  private _fn: () => T;

  /**
   * 标记 effect 是否处于活动状态
   * @public
   */
  active = true;

  /**
   * 存储此 effect 依赖的所有响应式对象
   * @private
   */
  private deps: Set<ReactiveEffect>[] = [];

  /**
   * 添加一个依赖集合到此 effect
   * @param dep - 依赖集合
   * @internal
   */
  addDep(dep: Set<ReactiveEffect>) {
    this.deps.push(dep);
  }

  /**
   * 清理函数，在 effect 重新运行前执行
   * @public
   */
  onStop?: () => void;

  /**
   * 自定义调度器
   * @public
   */
  scheduler?: (job: EffectRunner) => void;

  /**
   * @param fn - 要执行的副作用函数
   * @param scheduler - 可选的自定义调度器
   */
  constructor(fn: () => T, scheduler?: (job: EffectRunner) => void) {
    this._fn = fn;
    this.scheduler = scheduler || (() => {});
  }

  /**
   * 运行副作用函数
   * @returns {T} 副作用函数的返回值
   */
  run(): T {
    if (!this.active) {
      return this._fn();
    }

    // 清理旧的依赖
    cleanupEffect(this);
    
    // 设置当前激活的 effect
    activeEffect = this;
    effectStack.push(this);

    try {
      return this._fn();
    } finally {
      // 恢复上一个 effect
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1];
    }
  }

  /**
   * 停止 effect 的响应式追踪
   */
  stop() {
    if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}

/**
 * 清理 effect 的所有依赖
 * @param effect - 要清理的 ReactiveEffect 实例
 */
function cleanupEffect(effect: ReactiveEffect) {
  (effect as any).deps.forEach((dep: Set<ReactiveEffect>) => dep.delete(effect));
  (effect as any).deps.length = 0;
}

// ==================== 全局状态 ====================

/**
 * 当前正在执行的 effect
 * @internal
 */
export let activeEffect: ReactiveEffect | undefined = undefined;

/**
 * (内部使用) 设置当前的ternal
 */
export function setActiveEffect(effect: ReactiveEffect | undefined) {
  activeEffect = effect;
}

/**
 * effect 嵌套栈，用于处理嵌套 effect
 * @internal
 */
const effectStack: (ReactiveEffect | undefined)[] = [];

/**
 * 依赖收集的目标 Map
 * @internal
 */
const targetMap = new WeakMap<object, Map<any, Set<ReactiveEffect>>>();

// ==================== API ====================

/**
 * 追踪依赖
 * @description 当一个响应式对象被读取时，收集当前正在执行的 effect 作为其依赖
 * @param target - 响应式对象
 * @param key - 被读取的属性
 * @internal
 */
export function track(target: object, key: any) {
  if (!activeEffect) {
    return;
  }

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  trackEffects(dep);
}

/**
 * 将当前 activeEffect 添加到依赖集合中
 * @param dep - 依赖集合 (Set)
 * @internal
 */
/**
 * 将当前 activeEffect 添加到依赖集合中，并让 activeEffect 反向追踪该集合
 * @param dep - 依赖集合 (Set)
 * @internal
 */
export function trackEffects(dep: Set<ReactiveEffect>) {
    if (activeEffect && !dep.has(activeEffect)) {
        dep.add(activeEffect);
        activeEffect.addDep(dep);
    }
}


/**
 * 触发依赖
 * @description 当一个响应式对象被修改时，执行所有依赖于它的 effect
 * @param target - 响应式对象
 * @param key - 被修改的属性
 * @internal
 */
export function trigger(target: object, key: any) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }

  const dep = depsMap.get(key);
  if (dep) {
    triggerEffects(dep);
  }
}

/**
 * 触发一个依赖集合中的所有 effect
 * @param dep - 依赖集合 (Set)
 * @internal
 */
const queue = new Set<ReactiveEffect>();
let isFlushPending = false;





function scheduleFlush() {
  if (!isFlushPending) {
    isFlushPending = true;
    Promise.resolve().then(flushJobs);
  }
}

export function queueEffect(effect: ReactiveEffect) {
  if (!queue.has(effect)) {
    queue.add(effect);
    scheduleFlush();
  }
}



export function triggerEffects(dep: Set<ReactiveEffect>) {
    for (const effect of dep) {
        if (effect !== activeEffect) {
            if (effect.scheduler) {
                effect.scheduler(effect.run.bind(effect) as EffectRunner);
            } else {
                queueEffect(effect.run.bind(effect));
            }
        }
    }
}


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
export function createEffect<T = any>(
  fn: () => T,
  options?: EffectOptions
): EffectRunner<T> {
  const _effect = new ReactiveEffect(fn, options?.scheduler);

  if (!options?.lazy) {
    _effect.run();
  }

  const runner = _effect.run.bind(_effect) as EffectRunner<T>;
  runner.effect = _effect;

  return runner;
}


