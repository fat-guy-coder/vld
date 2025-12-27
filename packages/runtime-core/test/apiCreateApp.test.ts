import { describe, it, expect, vi } from 'vitest';
import { createAppAPI } from '@ld/runtime-core';

describe('runtime-core/apiCreateApp', () => {
  it('should create an app instance and mount a component', () => {
    // 1. Create a mock renderer
    const mockRender = vi.fn();

    // 2. Create the createApp function using the factory
    const createApp = createAppAPI(mockRender);

    // 3. Define a simple root component
    const RootComponent = {
      setup() {},
      render() {},
    };

    // 4. Create the app instance
    const app = createApp(RootComponent);

    // 5. Define a container to mount to
    const container = { id: 'app' };

    // 6. Mount the app
    app.mount(container);

    // 7. Assert that the renderer was called with the correct arguments
    expect(mockRender).toHaveBeenCalledTimes(1);
    expect(mockRender).toHaveBeenCalledWith(RootComponent, container);
  });
});

