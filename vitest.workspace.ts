import { defineWorkspace } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

// Vitest 工作区配置
// 当为新模块创建第一个测试文件后，AI会自动将该模块的配置添加到此列表中。
export default defineWorkspace([
  {
    plugins: [tsconfigPaths()],
    test: {
      name: 'reactivity',
      include: ['packages/reactivity/test/**/*.test.ts'],
      environment: 'node',
    },
  },
  {
    plugins: [tsconfigPaths()],
    test: {
      name: 'runtime-core',
      include: ['packages/runtime-core/test/**/*.test.ts'],
      environment: 'jsdom',
    },
  },
  {
    plugins: [tsconfigPaths()],
    test: {
      name: 'compiler-core',
      include: ['packages/compiler-core/test/**/*.test.ts'],
      environment: 'node',
    },
  },
]);
