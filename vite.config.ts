import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { vitePluginDevConsole } from './scripts/vite-plugin-dev-console.mts'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const rootDir = __dirname
const packagesDir = resolve(rootDir, 'packages')

/**
 * VLD 框架开发服务器配置
 * @description 提供开发环境的热更新、路径别名和模块解析
 */
export default defineConfig({
  // 根目录设置为项目根目录，以便访问所有包
  root: rootDir,
  
  // 服务器配置
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true,
    fs: {
      // 允许访问项目根目录和所有包目录
      allow: [rootDir, packagesDir],
    },
  },

  // 路径别名配置
  resolve: {
    alias: {
      '@vld/reactivity': resolve(packagesDir, 'reactivity/src'),
      '@vld/runtime-core': resolve(packagesDir, 'runtime-core/src'),
      '@vld/runtime-dom': resolve(packagesDir, 'runtime-dom/src'),
      '@vld/compiler-core': resolve(packagesDir, 'compiler-core/src'),
      '@vld/compiler-sfc': resolve(packagesDir, 'compiler-sfc/src'),
      '@vld/router': resolve(packagesDir, 'router/src'),
      '@vld/vld': resolve(packagesDir, 'vld/src'),
      '@vld/vite-plugin': resolve(packagesDir, 'vite-plugin/src'),
      '@vld/cli': resolve(packagesDir, 'cli/src'),
      '@vld/devtools': resolve(packagesDir, 'devtools/src'),
      // 通用别名，匹配所有 @vld/* 模块
      '@vld': resolve(packagesDir),
    },
  },

  // 依赖优化
  optimizeDeps: {
    include: ['@vld/reactivity', '@vld/router'],
    exclude: [],
  },

  // 构建配置
  build: {
    target: 'esnext',
    minify: false,
    sourcemap: true,
  },

  // TypeScript 配置
  esbuild: {
    target: 'esnext',
    format: 'esm',
  },

  // 插件配置
  plugins: [
    vitePluginDevConsole(),
  ],
})

