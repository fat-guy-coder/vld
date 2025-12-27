import { describe, it, expect } from 'vitest';
import { createApp, createSignal } from '@ld/runtime-dom';

describe('runtime-dom integration', () => {
  it('should create and mount a component that reacts to state changes', () => {
    // 1. Create a container element in the JSDOM environment
    const container = document.createElement('div');

    // 2. Define a simple reactive component
    const [count, setCount] = createSignal(0);
    const App = {
      setup() {
        return { count };
      },
      render(ctx: any) {
        return {
          type: 'div',
          props: { id: 'counter' },
          children: `Count: ${ctx.count()}`,
        };
      },
    };

    // 3. Create and mount the app
    createApp(App).mount(container);

    // 4. Assert initial render is correct
    const counterEl = container.querySelector('#counter');
    expect(counterEl).not.toBeNull();
    expect(counterEl?.textContent).toBe('Count: 0');

    // 5. Update the state
    setCount(1);

    // 6. Assert the DOM has been updated
    expect(counterEl?.textContent).toBe('Count: 1');
  });
});


