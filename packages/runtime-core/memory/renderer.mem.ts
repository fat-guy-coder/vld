import { createRenderer, type RendererOptions } from '../src';

// 模拟一个无操作的渲染器，以隔离测量核心运行时本身的内存开销
const noopRendererOptions: RendererOptions = {
  createElement: () => ({}),
  patchProp: () => {},
  insert: () => {},
  remove: () => {},
  createText: (text) => ({ text }),
  setText: () => {},
};

const { render } = createRenderer(noopRendererOptions);

const StaticComponent = {
  setup() {
    return {};
  },
  render() {
    return { type: 'div', children: 'hello' };
  },
};

/**
 * @description 内存测试的执行函数，由 memory.mts 脚本调用。
 */
export function run() {
  const COUNT = 1000;
  const retained: any[] = [];
  const container = {}; // 虚拟容器

  for (let i = 0; i < COUNT; i++) {
    const vnode = { type: StaticComponent, props: {} };
    render(vnode.type, container);
    retained.push(vnode); // 保留 VNode 以分析内存
  }

  // 将保留的对象暴露给 puppeteer，以便 memory.mts 脚本可以访问它们
  (window as any).__retainedObjects = retained;
}

