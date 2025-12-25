// ==================================================================================================
// VNode (虚拟节点) 定义
// ==================================================================================================

/**
 * @description VNode 类型的唯一标识。
 * @internal
 */
export const VNodeSymbol = Symbol('VNode');

/**
 * @description VNode 类型的枚举，用于区分不同类型的虚拟节点。
 * @public
 * @since v0.1.0
 */
export const VNodeTypes = {
  ELEMENT: 'element',
  TEXT: 'text',
  COMPONENT: 'component',
  FRAGMENT: 'fragment',
};

/**
 * @description 定义一个虚拟节点（VNode）的公共接口。
 * VNode 是对真实 DOM 节点的轻量级抽象，包含了渲染真实节点所需的所有信息。
 * @public
 * @since v0.1.0
 */
export interface VNode {
  /**
   * @description VNode 类型的唯一标识，用于内部检查。
   */
  [VNodeSymbol]: true;

  /**
   * @description VNode 的类型，如 'element', 'text', 'component'。
   */
  type: string;

  /**
   * @description 对于元素节点，这是标签名（如 'div'）；对于文本节点，这是文本内容。
   */
  tag: string | object;

  /**
   * @description 节点的属性和事件监听器。
   */
  props: Record<string, any> | null;

  /**
   * @description 子节点数组。
   */
  children: (VNode | string)[] | null;

  /**
   * @description 对真实 DOM 节点的引用。
   */
  el: HTMLElement | Text | null;

  /**
   * @description 对于组件 VNode，这是组件实例的引用。
   */
  component: any | null; // 替换为 ComponentInstance 类型
}

// ==================================================================================================
// VNode 创建函数
// ==================================================================================================

/**
 * @description 创建一个 VNode 实例。
 * @param type - VNode 类型。
 * @param tag - 标签名或组件定义。
 * @param props - 属性。
 * @param children - 子节点。
 * @returns 一个 VNode 对象。
 * @internal
 * @since v0.1.0
 */
export function createVNode(
  type: string,
  tag: string | object,
  props: Record<string, any> | null = null,
  children: (VNode | string)[] | null = null
): VNode {
  return {
    [VNodeSymbol]: true,
    type,
    tag,
    props,
    children,
    el: null,
    component: null,
  };
}

/**
 * @description 创建一个文本 VNode。
 * @param text - 文本内容。
 * @returns 一个文本类型的 VNode 对象。
 * @public
 * @since v0.1.0
 */
export function createTextVNode(text: string): VNode {
  return createVNode(VNodeTypes.TEXT, text);
}

/**
 * @description 判断一个对象是否是 VNode。
 * @param value - 要检查的值。
 * @returns 如果是 VNode 则返回 true，否则返回 false。
 * @internal
 * @since v0.1.0
 */
export function isVNode(value: any): value is VNode {
  return value ? value[VNodeSymbol] === true : false;
}

