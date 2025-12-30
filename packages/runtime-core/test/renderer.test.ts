import { describe, it, expect, vi } from 'vitest';
import { createSignal } from '@ld/reactivity';
import { createRenderer, type RendererOptions } from '@ld/runtime-core';

// 模拟平台相关的 DOM 操作
const mockRendererOptions: RendererOptions = {
  createElement: vi.fn(() => ({ tag: '', props: {}, children: [], parent: null })),
  patchProp: vi.fn(),
  insert: vi.fn(),
  remove: vi.fn(),
  createText: vi.fn((text) => ({ text })),
  setText: vi.fn((node, text) => {
    (node as any).text = text;
  }),
};

const { render } = createRenderer(mockRendererOptions);

describe('runtime-core/renderer', () => {
  it('should mount component and call platform API', () => {
    mockRendererOptions.createElement.mockClear();
    mockRendererOptions.insert.mockClear();

    const Counter = {
      setup() {
        return { count: 1 };
      },
      render(ctx: any) {
        return { type: 'div', props: { id: 'root' }, children: String(ctx.count) };
      },
    };

    const container = {};
    render(Counter as any, container);

    expect(mockRendererOptions.createElement).toHaveBeenCalledWith('div');
    expect(mockRendererOptions.insert).toHaveBeenCalled();
  });

  it('should update on signal change', async () => {
    const [count, setCount] = createSignal(0);

    // 通过一个局部变量捕获 setText 调用次数
    mockRendererOptions.setText.mockClear();

    const Counter = {
      setup() {
        return { count };
      },
      render(ctx: any) {
        return { type: 'div', props: {}, children: String(ctx.count()) };
      },
    };

    const container = {};
    render(Counter as any, container);

    // 更新 signal
    setCount(1);

    // 等待微任务队列刷新，以确保 effect 已执行
    await Promise.resolve();

    // 期望 setText 被调用一次表示内容已更新
    expect(mockRendererOptions.setText).toHaveBeenCalledTimes(1);
  });
});