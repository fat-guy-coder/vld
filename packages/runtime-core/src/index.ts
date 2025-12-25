// ===== component/index.ts =====
export {
  type Component,
  type ComponentInstance,
  createComponentInstance,
  onMount,
  onUpdate,
  onUnmount,
} from './component';

// ===== vnode/index.ts =====
export {
  VNodeSymbol,
  VNodeTypes,
  type VNode,
  createVNode,
  createTextVNode,
  isVNode,
} from './vnode';

// ===== renderer/vdomRenderer.ts =====
// Note: This is an optional, V-DOM-based renderer.
// The default renderer will be compiler-based for direct DOM manipulation.
export {
  createVdomRenderer,
  type RendererOptions as VdomRendererOptions,
} from './renderer/vdomRenderer';