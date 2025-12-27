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

### 开发

-   `pnpm dev:all`: 并行启动所有核心开发服务，进入监听模式。
-   `pnpm dev:reactivity`: 单独启动 `@ld/reactivity` 模块的开发服务。

### 构建

-   `pnpm build:all`: 构建 monorepo 中的所有包。
-   `pnpm build:prod`: 以生产模式构建所有包（包含优化）。
-   `pnpm build:fast`: 快速构建，跳过类型检查和测试，用于快速验证。

### 测试

-   `pnpm test`: **智能运行**所有**活动模块**的单元测试。
-   `pnpm test:watch`: 在监听模式下运行测试。
-   `pnpm test:coverage`: 运行测试并生成覆盖率报告。
-   `pnpm test:ai`: **智能运行**活动模块的测试，并生成为AI优化的JSON报告。

### 性能评测

-   `pnpm bench`: 运行性能评测脚本，获取框架核心指标的实时性能数据。

### 代码质量

-   `pnpm lint`: 检查整个项目的代码风格。
-   `pnpm lint:fix`: 自动修复代码风格问题。
-   `pnpm format`: 使用 Prettier 格式化所有代码。
-   `pnpm type-check`: 对整个项目进行 TypeScript 类型检查。

## 🤝 贡献

欢迎所有形式的贡献！请在提交 Pull Request 前确保所有测试和代码检查都已通过。

## 📄 许可证

[MIT](./LICENSE)
