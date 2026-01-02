import { queueJob } from './batch';
import { globalState } from './store';
import type { SignalNode } from './store';

export interface EffectOptions {
  scheduler?: ((effect: ReactiveEffect) => void) | null;
  dynamic?: boolean;
}

export class ReactiveEffect<T = any> {
  public id: number;
  next: ReactiveEffect | null = null;
  deps: Set<SignalNode> = new Set();
  public isStatic: boolean;

  constructor(
    public fn: () => T,
    public scheduler: ((effect: ReactiveEffect<T>) => void) | null = null,
    isStatic = false
  ) {
    this.id = globalState.effectIdCounter++;
    this.isStatic = isStatic;
  }

  run(): T {
    // 为静态 effect 提供零开销的“快速通道”
    if (this.isStatic) {
      return this.fn();
    }

    // 动态 effect 的标准路径
    if (!globalState.effectStack.includes(this)) {
      try {
        cleanupEffect(this);
        globalState.effectStack.push(this);
        return this.fn();
      } finally {
        globalState.effectStack.pop();
      }
    }
    return undefined as any;
  }

  stop() {
    cleanupEffect(this);
  }
}

function cleanupEffect(effect: ReactiveEffect) {
  for (const dep of effect.deps) {
    let current = dep.observers;
    let prev: ReactiveEffect | null = null;
    while (current) {
      if (current === effect) {
        if (prev) {
          prev.next = current.next;
        } else {
          dep.observers = current.next;
        }
        break;
      }
      prev = current;
      current = current.next;
    }
  }
  effect.deps.clear();
}

export function getActiveEffect(): ReactiveEffect | undefined {
  return globalState.effectStack[globalState.effectStack.length - 1];
}

export function track(node: SignalNode) {
  const effect = getActiveEffect();
  if (effect) {
    if (!effect.deps.has(node)) {
      effect.next = node.observers;
      node.observers = effect;
      effect.deps.add(node);
    }
  }
}

export function trigger(node: SignalNode) {
  let effect = node.observers;
  while (effect) {
    if (effect.scheduler) {
      effect.scheduler(effect);
    } else {
      effect.run();
    }
    effect = effect.next;
  }
}

export function createEffect(fn: () => void, options?: EffectOptions): ReactiveEffect {
  const scheduler = options?.scheduler === undefined ? queueJob : options.scheduler;
  const isStatic = options?.dynamic === false;
  const effect = new ReactiveEffect(fn, scheduler, isStatic);
  
  // 首次运行必须通过标准路径以收集依赖
  // 因此我们临时禁用 isStatic 标志
  const originalIsStatic = effect.isStatic;
  effect.isStatic = false;
  effect.run();
  effect.isStatic = originalIsStatic;

  return effect;
}
