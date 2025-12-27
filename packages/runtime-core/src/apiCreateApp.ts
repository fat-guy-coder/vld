import { createRenderer } from './renderer';
import type { Component } from './component';

/**
 * @description Represents a mounted application instance.
 * @public
 * @since v0.1.0
 */
export interface App<HostElement = any> {
  mount(rootContainer: HostElement | string): void;
  // TODO: Add unmount, config, etc.
}

/**
 * @description Factory function to create the `createApp` function.
 * This allows the `createApp` logic to be platform-agnostic.
 * @param renderer - The platform-specific renderer function.
 * @internal
 */
export function createAppAPI(render: ReturnType<typeof createRenderer>['render']) {
  /**
   * @description Creates an application instance.
   * @param rootComponent - The root component of the application.
   * @returns An application instance with a `mount` method.
   */
  return function createApp(rootComponent: Component): App {
    const app: App = {
      mount(rootContainer: any) {
        // The actual rendering is delegated to the platform-specific renderer.
        render(rootComponent, rootContainer);
      },
    };

    return app;
  };
}


