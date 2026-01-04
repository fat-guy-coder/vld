import { createSignal } from '@ld/reactivity';
import { createRenderer, type RendererOptions } from '../src';
import type { Bench } from 'tinybench';

// 模拟一个极简的、无操作的渲染器，以隔离测量 runtime-core 本身的开销
const noopRendererOptions: RendererOptions = {
  createElement: () => ({}),
  patchProp: () => {},
  insert: () => {},
  remove: () => {},
  createText: (text) => ({ text }),
  setText: (node, text) => {
    (node as any).text = text;
  },
};

const { render } = createRenderer(noopRendererOptions);

const StaticComponent = {
  setup() {
    return { count: 1 };
  },
  render(ctx: any) {
    return { type: 'div', children: String(ctx.count) };
  },
};

// benchmark.mts 会调用这个默认导出的函数
export default function (bench: Bench) {
  bench.add('component mount', () => {
    const container = {};
    render(StaticComponent as any, container);
  });

  bench.add('component update', () => {
    const count = createSignal(0);
    const DynamicComponent = {
      setup() {
        return { count };
      },
      render(ctx: any) {
        return { type: 'div', children: String(ctx.count()) };
      },
    };
    const container = {};
    render(DynamicComponent as any, container);

    // 触发更新
    count(1);
  });
}
