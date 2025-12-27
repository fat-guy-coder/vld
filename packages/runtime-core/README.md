# @ld/runtime-core

`@ld/runtime-core` 是 LD 框架运行时的核心，它不依赖于任何特定平台（例如浏览器DOM或原生环境）。该包负责管理组件实例、生命周期钩子，并协调渲染流程。

## 核心概念

`@ld/runtime-core` 被设计为渲染引擎的心脏。它提供了创建组件树和响应状态变化所必需的抽象，但将实际的元素创建和操作委托给特定于平台的渲染器。

这是通过一个 `createRenderer` 函数实现的，该函数接受一个包含平台特定操作（如创建元素、更新属性、插入节点）的 `RendererOptions` 对象。

## 公共 API

### `createRenderer(options: RendererOptions)`

创建一个特定于平台的渲染器实例。

-   **`options`**: 一个包含平台特定函数的对象（`createElement`, `patchProp`, `insert` 等）。

-   **返回**: 一个包含 `render` 函数的对象。

### `createAppAPI(render: Function)`

一个用于创建 `createApp` 函数的工厂函数。这是一个底层API，旨在供特定于平台的包（如 `@ld/runtime-dom`）使用。

-   **`render`**: `createRenderer` 返回的 `render` 函数。

-   **返回**: 一个 `createApp` 函数。

### `onMount(fn: () => void)`

注册一个在组件挂载后执行的回调函数。

### `onUpdate(fn: () => void)`

注册一个在组件因状态变化而更新后执行的回调函数。

### `onUnmount(fn: () => void)`

注册一个在组件卸载前执行的回调函数。

## 平台开发者使用示例

```typescript
import { createRenderer, createAppAPI } from '@ld/runtime-core';

// 1. 定义特定于平台的渲染逻辑
const domRendererOptions = {
  createElement: (tag) => document.createElement(tag),
  patchProp: (el, key, prev, next) => { el.setAttribute(key, next); },
  insert: (el, parent) => { parent.appendChild(el); },
  // ... 其他选项
};

// 2. 创建一个渲染器实例
const { render } = createRenderer(domRendererOptions);

// 3. 创建面向用户的 createApp 函数
export const createApp = createAppAPI(render);

// 4. 用户现在可以使用它
import { createApp } from './my-dom-renderer';
import App from './App.vue';

createApp(App).mount('#app');
```
