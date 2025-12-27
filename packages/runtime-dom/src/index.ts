import { createRenderer, createAppAPI } from '@ld/runtime-core';
import { nodeOps } from './node-ops';
import { patchProp } from './modules';

// Combine DOM-specific node operations and property patching logic
const rendererOptions = { ...nodeOps, patchProp };

/**
 * @description Creates a platform-specific renderer for the browser.
 * @internal
 */
const renderer = createRenderer(rendererOptions);

/**
 * @description Creates an application instance for use in the browser.
 * This is the main entry point for a user's application.
 * @param rootComponent - The root component of the application.
 * @returns An application instance with a `mount` method.
 * @public
 * @since v0.1.0
 * @example
 * import { createApp } from '@ld/runtime-dom';
 * import App from './App';
 *
 * createApp(App).mount('#app');
 */
export const createApp = createAppAPI(renderer.render);

// Re-export core APIs for user convenience
export * from '@ld/runtime-core';


