# LD - 极致性能前端框架

<p align="center">
  <strong>light! fast! performance! typescript! vue! react!</strong>
</p>

## 🚀 项目概述

LD (Vue & React Light & Fast) 是一个追求极致性能的前端框架，旨在提供比现有方案更快的响应式系统和渲染性能。框架完全兼容 Vue 3 和 React (Hooks) 的语法与生态，同时实现了零虚拟DOM的细粒度更新系统。

## ✨ 核心特性

-   **极致性能**: 所有核心模块都为性能而设计，追求最低的内存占用和最快的执行速度。
-   **零虚拟DOM**: 通过编译时优化和细粒度的响应式系统，直接进行原生DOM操作，消除了虚拟DOM的开销。
-   **完全兼容**: 无缝接入 Vue 3 和 React (Hooks) 的开发生态和语法习惯。
-   **类型安全**: 100% 使用 TypeScript 编写，提供完整的类型支持。
-   **轻量级**: 核心库极小，并支持 Tree Shaking，确保最终打包体积最小化。

## 🚧 项目进度

项目开发分为几个关键阶段，目前我们已经完成了核心的运行时基础。

### ✅ 第一阶段：核心运行时 (已完成)

-   **`@ld/reactivity`**: 实现了框架的响应式核心，包括 `signal`, `effect`, `computed` 等。
-   **`@ld/runtime-core`**: 实现了平台无关的组件模型、生命周期和渲染器API。
-   **`@ld/runtime-dom`**: 实现了针对浏览器的DOM渲染器，包括原生DOM操作和高效的属性更新。

### 🔄 第二阶段：编译与适配 (当前进行中)

-   **`@ld/runtime-jsx`**: 提供JSX/TSX的运行时支持。

### ⏳ 第三阶段：未来规划

-   **编译器**: `@ld/compiler-core`, `@ld/compiler-sfc`, `@ld/babel-plugin-ld`
-   **生态兼容层**: `@ld/react`, `@ld/vue`, `@ld/router`
-   **工具链**: `@ld/vite-plugin`, `@ld/cli`, `@ld/devtools`

## 📦 模块概览

项目采用 monorepo 结构，各个模块职责清晰，高度解耦。

| 包名 | 状态 | 描述 |
| :--- | :--- | :--- |
| `@ld/reactivity` | ✅ 已完成 | 框架的响应式核心，提供 `signal`, `effect` 等底层能力。 |
| `@ld/runtime-core` | ✅ 已完成 | 平台无关的运行时，定义了组件模型和渲染流程。 |
| `@ld/runtime-dom` | ✅ 已完成 | 针对浏览器的渲染器，负责真实DOM操作。 |
| `@ld/runtime-jsx` | 🔄 进行中 | 为 JSX/TSX 提供运行时支持。 |
| `@ld/compiler-core` | ⏳ 待开发 | 模板编译器核心，将模板转换为渲染函数。 |
| `@ld/compiler-sfc` | ⏳ 待开发 | 用于解析和编译 `.vue` 单文件组件。 |
| `@ld/babel-plugin-ld` | ⏳ 待开发 | 用于将 JSX 转换为对 `@ld/runtime-jsx` 调用的 Babel 插件。 |
| `@ld/react` | ⏳ 待开发 | React Hooks API 的兼容层。 |
| `@ld/vue` | ⏳ 待开发 | Vue Composition API 的兼容层。 |
| `@ld/router` | ⏳ 待开发 | 官方路由系统。 |
| `ld` | ⏳ 待开发 | 框架的主入口包，统一导出常用API。 |
| `@ld/vite-plugin` | ⏳ 待开发 | Vite 集成插件。 |
| `@ld/cli` | ⏳ 待开发 | 命令行工具，用于项目创建和管理。 |
| `@ld/devtools` | ⏳ 待开发 | 浏览器开发者工具扩展。 |

## 🛠️ 命令指南

本项目使用 `pnpm` 作为包管理器。以下是主要的开发命令：

| Command | Description |
| :--- | :--- |
| `pnpm dev` | 启动开发服务器。 |
| `pnpm dev:all` | 并行启动所有核心开发服务，进入监听模式。 |
| `pnpm build` | 构建指定的包。 |
| `pnpm build:all` | 构建 monorepo 中的所有包。 |
| `pnpm build:prod` | 以生产模式构建所有包（包含优化）。 |
| `pnpm test` | **智能运行**所有**活动模块**的单元测试。 |
| `pnpm test:watch` | 在监听模式下运行测试。 |
| `pnpm test:coverage` | 运行测试并生成覆盖率报告。 |
| `pnpm test:ai` | **智能运行**活动模块的测试，并生成为AI优化的JSON报告。 |
| `pnpm test:memory` | 运行内存使用情况测试。 |
| `pnpm bench` | 运行性能评测脚本，获取框架核心指标的实时性能数据。 |
| `pnpm lint` | 检查整个项目的代码风格。 |
| `pnpm lint:fix` | 自动修复代码风格问题。 |
| `pnpm format` | 使用 Prettier 格式化所有代码。 |
| `pnpm type-check` | 对整个项目进行 TypeScript 类型检查。 |
| `pnpm release` | 创建一个新的版本发布。 |
| `pnpm clean` | 清理所有构建产物。 |

## 📦 外部依赖

本项目依赖以下主要的外部工具和库：

| Package | Version | Description |
| :--- | :--- | :--- |
| `typescript` | `^5.3.3` | 提供类型安全和现代 JavaScript 特性。 |
| `vite` | `^5.0.8` | 下一代前端构建工具，提供极速的开发服务器和优化的构建。 |
| `vitest` | `^1.2.2` | 由 Vite 驱动的极速单元测试框架。 |
| `puppeteer` | `^24.34.0` | 用于在无头浏览器环境中运行内存测试。 |
| `tinybench` | `^6.0.0` | 一个小巧而快速的基准测试库，用于性能评测。 |
| `eslint` | `^8.57.0` | 可插拔的 JavaScript 和 TypeScript 代码检查工具。 |
| `prettier` | `^3.2.4` | 一个固执己见的代码格式化工具，用于保持代码风格一致。 |
| `@changesets/cli` | `^2.26.2` | 用于管理 monorepo 的版本控制和发布流程。 |
| `husky` | `^8.0.3` | 用于设置 Git 钩子，确保代码提交质量。 |
| `pnpm` | `^8.15.0` | 快速、节省磁盘空间的包管理器。 |

## 🤝 贡献

欢迎所有形式的贡献！请在提交 Pull Request 前确保所有测试和代码检查都已通过。

## 📄 许可证

[MIT](./LICENSE)
