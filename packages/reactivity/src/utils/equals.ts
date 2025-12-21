/**
 * 深度比较两个值是否相等
 * @description 提供一个比 `Object.is` 更强大的深度比较功能，能够处理对象、数组和循环引用。
 * @param a - 第一个值
 * @param b - 第二个值
 * @param seen - (内部使用) 用于检测循环引用的 Set
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
export function deepEquals(a: any, b: any, seen = new Set()): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (a && typeof a === 'object' && b && typeof b === 'object') {
    if (seen.has(a) || seen.has(b)) {
      return true; // 假设循环引用的结构是相同的
    }
    seen.add(a);
    seen.add(b);

    if (a.constructor !== b.constructor) {
      return false;
    }

    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEquals(a[i], b[i], seen)) return false;
      }
      return true;
    }

    if (a instanceof Map) {
      if (a.size !== b.size) return false;
      for (const [key, value] of a) {
        if (!b.has(key) || !deepEquals(value, b.get(key), seen)) {
          return false;
        }
      }
      return true;
    }

    if (a instanceof Set) {
      if (a.size !== b.size) return false;
      const bValues = Array.from(b.values());
      let i = 0;
      for (const value of a) {
        if (!deepEquals(value, bValues[i], seen)) return false;
        i++;
      }
      return true;
    }

    if (a instanceof Date) {
      return a.getTime() === b.getTime();
    }

    if (a instanceof RegExp) {
      return a.source === b.source && a.flags === b.flags;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (const key of keysA) {
      if (!keysB.includes(key) || !deepEquals((a as any)[key], (b as any)[key], seen)) {
        return false;
      }
    }

    return true;
  }

  return false;
}

