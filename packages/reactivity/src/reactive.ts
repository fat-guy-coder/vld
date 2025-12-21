import { track, trigger } from './effect';

// ==================== 类型定义 ====================

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  RAW = '__v_raw',
}

export interface Target {
  [ReactiveFlags.IS_REACTIVE]?: boolean;
  [ReactiveFlags.RAW]?: any;
}

// ==================== 缓存 ====================

const reactiveMap = new WeakMap<Target, any>();

// ==================== 核心实现 ====================

const mutableHandlers: ProxyHandler<object> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    if (key === ReactiveFlags.RAW) {
      return target;
    }

    const res = Reflect.get(target, key, receiver);
    track(target, key);

    if (typeof res === 'object' && res !== null) {
      // 深度响应式：如果获取到的是对象，也将其转换为响应式
      return createReactiveObject(res);
    }

    return res;
  },

  set(target, key, value, receiver) {
    const oldValue = (target as any)[key];
    const result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, key);
    }
    return result;
  },

  deleteProperty(target, key) {
    const hadKey = Object.prototype.hasOwnProperty.call(target, key);
    const result = Reflect.deleteProperty(target, key);
    if (hadKey && result) {
      trigger(target, key);
    }
    return result;
  },

  has(target, key) {
    const result = Reflect.has(target, key);
    track(target, key);
    return result;
  },

  ownKeys(target) {
    track(target, Array.isArray(target) ? 'length' : Symbol('iterate'));
    return Reflect.ownKeys(target);
  },
};

function createReactiveObject<T extends object>(target: T): T {
  if (typeof target !== 'object' || target === null) {
    return target;
  }

  if ((target as Target)[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }

  const existingProxy = reactiveMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }

  const proxy = new Proxy(target, mutableHandlers);
  reactiveMap.set(target, proxy);
  return proxy as T;
}

// ==================== API ====================

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
export function createReactive<T extends object>(target: T): T {
  return createReactiveObject(target);
}

