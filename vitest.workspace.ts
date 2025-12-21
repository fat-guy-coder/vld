import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  // reactivity package
  {
    test: {
      name: 'reactivity',
      include: ['packages/reactivity/test/**/*.test.ts'],
      environment: 'node',
    },
  },
  
  // router package
  {
    test: {
      name: 'router',
      include: ['packages/router/test/**/*.test.ts'],
      environment: 'jsdom',
    },
  },
  
  // compiler-core package
  {
    test: {
      name: 'compiler-core',
      include: ['packages/compiler-core/src/**/*.test.ts'],
      environment: 'node',
    },
  },
  
  // runtime-core package
  {
    test: {
      name: 'runtime-core',
      include: ['packages/runtime-core/src/**/*.test.ts'],
      environment: 'jsdom',
    },
  },
  
  // integration tests for all packages
  {
    test: {
      name: 'integration',
      include: ['tests/**/*.test.ts'],
      environment: 'jsdom',
    },
  },
]);
