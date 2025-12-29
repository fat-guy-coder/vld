import { queueJob } from './batch';
import { globalState } from './store';

/**
 * @description Effect函数的选项，目前为空，为未来扩展保留。
 * @since v0.1.0
 */
export interface EffectOptions { }

/**
 * @description 一个响应式Effect的内部表示。
 * @internal
 */
export class ReactiveEffect<T = any> {
  /**
   * @description 此Effect依赖的Signal集合。
   */
  deps: Set<Set<ReactiveEffect>> = new Set();

  constructor(
    public fn: () => T,
    public scheduler: ((effect: ReactiveEffect<T>) => void) | null = null
  ) { }

  run(): T {
    // 如果effect不存在于栈中，则运行
    if (!globalState.effectStack.includes(this)) {
      try {
        // 清理旧的依赖
        cleanupEffect(this);
        // 设置当前effect为active
        globalState.effectStack.push(this);
        // 运行用户提供的函数，这将触发依赖的Signal的getter
        return this.fn();
      } finally {
        // 恢复之前的effect状态
        globalState.effectStack.pop();
      }
    }
    // 如果effect已在栈中，直接返回undefined，避免无限循环
    return undefined as any;
  }

  stop() {
    cleanupEffect(this);
  }
}

/**
 * @description 清理一个effect的所有依赖。
 * @param effect - 要清理的ReactiveEffect实例。
 * @internal
 */
function cleanupEffect(effect: ReactiveEffect) {
  const { deps } = effect;
  if (deps.size) {
    for (const dep of deps) {
      dep.delete(effect);
    }
    deps.clear();
  }
}

/**
 * @description 获取当前活动的effect。
 * @returns 当前的ReactiveEffect实例，如果没有则为undefined。
 * @internal
 */
export function getActiveEffect(): ReactiveEffect | undefined {
  return globalState.effectStack[globalState.effectStack.length - 1];
}

/**
 * @description 追踪一个Signal的依赖。
 * @param observers - Signal的观察者集合。
 * @internal
 */
export function track(observers: Set<ReactiveEffect>) {
  const effect = getActiveEffect();
  if (effect) {
    observers.add(effect);
    effect.deps.add(observers);
  }
}

/**
 * @description 触发一个Signal的所有依赖effect。
 * @param observers - Signal的观察者集合。
 * @internal
 */
export function trigger(observers: Set<ReactiveEffect>) {
  // 复制集合以避免在迭代期间修改
  // Directly iterating over the Set using forEach is the most memory-efficient approach,
  // as it avoids creating a new array or Set on every trigger.
  observers.forEach(effect => {
    if (effect.scheduler) {
      effect.scheduler(effect);
    } else {
      effect.run();
    }
  });
}

/**
 * @description 创建一个副作用，当其依赖的Signal变化时会自动重新运行。
 * @param fn - 要运行的副作用函数。
 * @returns 一个包含stop方法的effect实例，用于手动停止副作用。
 * @example
 * const [count, setCount] = createSignal(0);
 * createEffect(() => {
 *   console.log('Count is:', count());
 * });
 * // 'Count is: 0' 将被打印
 * setCount(1);
 * // 'Count is: 1' 将被打印
 * @performance 性能开销主要在依赖收集和函数执行，设计为高性能。
 * @since v0.1.0
 */
export function createEffect(fn: () => void): ReactiveEffect {
  const effect = new ReactiveEffect(fn, queueJob);
  // 立即执行一次以收集初始依赖
  effect.run();
  return effect;
}
