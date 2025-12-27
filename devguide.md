# LD - 极致性能前端框架

## 🚀 项目概述

LD（Vue & React Light & Fast）是一个追求极致性能的前端框架，旨在提供比现有方案更快的响应式系统和渲染性能。框架完全兼容Vue3语法和生态系统React(Hooks)语法和生态系统，同时实现了零虚拟DOM的细粒度更新系统。

核心理念: light! fast! performance! typescript! vue! react!

## 🎯 性能目标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| Signal创建时间 | <0.01ms | 创建响应式信号的性能 |
| Signal读取时间 | <0.001ms | 读取信号值的性能 |
| Signal设置时间 | <0.005ms | 更新信号值的性能 |
| 组件挂载时间 | <0.1ms | 组件初始渲染性能 |
| 组件更新时间 | <0.05ms | 组件重新渲染性能 |
| 打包体积 | <10KB (gzipped) | 最小化运行时体积 |

## 📁 项目结构

```
packages/
├── reactivity/ # 响应式系统核心
│ ├── src/
│ │ ├── signal.ts # Signal工厂，依赖收集
│ │ ├── effect.ts # 副作用追踪
│ │ ├── computed.ts # 计算属性
│ │ ├── reactive.ts # Proxy响应式对象
│ │ ├── batch.ts # 批量更新
│ │ └── index.ts # 模块导出
│ └── test/ # 单元测试
├── runtime-core/ # 组件渲染引擎
├── runtime-dom/ # DOM环境适配器
├── compiler-core/ # 模板编译器
├── compiler-sfc/ # 单文件组件编译
├── router/ # 路由系统
├── ld/ # 框架主入口
├── vite-plugin/ # Vite插件
├── cli/ # 命令行工具
└── devtools/ # 开发者工具
```

## 🔧 核心特性

LD框架的核心特性围绕其三大基石构建：**响应式核心**、**平台无关的运行时** 和 **浏览器DOM渲染器**。

### 1. `@ld/reactivity` - 极致性能的响应式核心

这是框架的基石，提供了一套完全独立、性能极致的响应式原语。

-   **Signal (信号)**: 核心的响应式容器，提供 `getter` 和 `setter`。更新是细粒度的，只会精确触发依赖于它的副作用。
-   **Effect (副作用)**: 自动追踪其执行期间读取的 `Signal`，并在这些 `Signal` 变化时重新运行。这是实现自动更新的引擎。
-   **Computed (计算属性)**: 基于一个或多个 `Signal` 的衍生值。它们是惰性求值的，并且会缓存结果，只有在依赖项变化时才会重新计算。
-   **Reactive (深层响应式)**: 使用 `Proxy` 为对象和数组创建深层响应式代理，使得对嵌套属性的修改也能被追踪。
-   **Batch (批量更新)**: 允许将多个状态变更组合在一起，在所有变更完成后只触发一次UI更新，极大地优化了性能。

### 2. `@ld/runtime-core` - 平台无关的渲染引擎

这是连接响应式系统和最终渲染输出的桥梁。它定义了组件的结构和行为，但不关心最终渲染到什么平台（浏览器、原生应用等）。

-   **组件实例 (Component Instance)**: 每个组件在运行时都有一个内部实例，用于管理其状态、生命周期和渲染 `effect`。
-   **生命周期钩子**: 提供 `onMount`, `onUpdate`, `onUnmount` 等钩子，让开发者可以在组件生命周期的关键时刻执行代码。
-   **平台无关渲染器 API (`createRenderer`)**: 核心API，它接受一个包含平台特定操作（如创建元素、设置属性）的选项对象，并返回一个渲染器。这种设计使得框架可以轻松适配任何平台。
-   **应用实例 API (`createAppAPI`)**: 一个底层工厂函数，用于创建平台特定的 `createApp` 函数，统一了应用的创建和挂载流程。

### 3. `@ld/runtime-dom` - 高效的浏览器渲染器

这是 `@ld/runtime-core` 在浏览器环境下的具体实现，负责将组件树转换为真实的DOM节点。

-   **原生DOM操作 (`nodeOps`)**: 提供了 `document.createElement`, `insertBefore` 等原生DOM操作的直接封装，作为渲染器的基础。
-   **高效属性更新 (`patchProp`)**: 一个智能的属性更新调度器，能够高效地处理HTML属性、CSS类、内联样式和DOM事件监听器。
    -   **事件管理**: 内部优化了事件监听器的添加和移除，通过缓存 invoker 来避免内存泄漏和不必要的性能开销。
    -   **样式更新**: 支持对象和字符串两种形式的样式更新，并能进行高效的差异比对。
-   **面向用户的 `createApp`**: 框架的最终用户入口。它将响应式组件、运行时核心和DOM渲染器结合在一起，提供了简单易用的 `createApp(Component).mount('#app')` API。

## 🏛️ 架构深入解析

LD 框架的设计采用了经典的分层架构，确保了各部分职责单一、高度解耦、可独立测试和替换。这种设计是框架高性能和高可扩展性的基石。

```
+------------------------------------+
|      @ld/runtime-dom (浏览器)      |
+------------------------------------+
|     @ld/runtime-core (平台无关)     |
+------------------------------------+
|      @ld/reactivity (响应式核心)     |
+------------------------------------+
```

### 第一层：`@ld/reactivity` - 核心响应式层

-   **职责**：提供一套与平台完全无关的、高性能的响应式原语 (`createSignal`, `createEffect` 等)。
-   **特点**：纯粹的计算引擎。它不知道什么是组件，也不知道什么是DOM。它只负责追踪数据依赖，并在数据变化时调用相应的函数。
-   **优势**：由于其纯粹性，这一层可以被单独用于任何JavaScript环境，甚至在Node.js中，来实现任何需要响应式能力的逻辑。

### 第二层：`@ld/runtime-core` - 平台无关运行时层

-   **职责**：定义了框架的“组件”应该是什么样子，以及组件的生命周期和渲染流程应该如何管理。它消费来自 `@ld/reactivity` 的能力，将组件的 `render` 函数包裹在一个 `effect` 中，从而实现了“当状态变化时，组件自动重新渲染”的核心逻辑。
-   **特点**：这一层知道“组件”和“渲染”，但它不知道如何渲染。它通过 `createRenderer` API 定义了一个标准的渲染器接口（`RendererOptions`），要求上层平台提供具体的节点创建和操作方法。
-   **优势**：这种设计使得 LD 框架可以轻松地被移植到浏览器之外的任何平台，例如原生移动端（类似React Native）、小程序、甚至终端，只需要为目标平台提供一套符合 `RendererOptions` 接口的实现即可。

### 第三层：`@ld/runtime-dom` - 浏览器平台层

-   **职责**：为 `@ld/runtime-core` 提供在浏览器环境中运行所需的具体实现。它实现了 `RendererOptions` 接口，提供了 `document.createElement`、`el.setAttribute` 等真实DOM操作。
-   **特点**：这一层是框架与浏览器的“适配器”。它还包含了针对浏览器环境的大量优化，例如高效的事件处理、class和style的更新策略等。
-   **优势**：将所有与DOM相关的“脏活累活”都隔离在这一层，使得核心运行时保持干净和专注。未来如果浏览器API发生变化，我们只需要更新这一层，而无需触动框架的核心逻辑。

通过这种分层设计，我们实现了关注点分离，使得代码库的每一部分都更容易理解、维护和测试。

## 🏗️ 实现步骤

项目开发分为几个关键阶段，目前我们已经完成了核心的运行时基础。

### 第一阶段：核心运行时 (已完成)

-   ✅ **`@ld/reactivity`**: 实现了框架的响应式核心，包括 `signal`, `effect`, `computed` 等。
-   ✅ **`@ld/runtime-core`**: 实现了平台无关的组件模型、生命周期和渲染器API。
-   ✅ **`@ld/runtime-dom`**: 实现了针对浏览器的DOM渲染器，包括原生DOM操作和高效的属性更新。

### 第二阶段：编译与适配 (当前进行中)

-   🔄 **`@ld/runtime-jsx`**: 提供JSX/TSX的运行时支持，这是我们当前的重点。
-   ⏳ **`@ld/compiler-core`**: 模板编译器核心。
-   ⏳ **`@ld/compiler-sfc`**: 单文件组件（.vue）编译器。
-   ⏳ **`@ld/babel-plugin-ld`**: Babel插件，用于在编译时转换JSX。

### 第三阶段：生态与兼容层

-   ⏳ **`@ld/react`**: React Hooks 兼容层。
-   ⏳ **`@ld/vue`**: Vue Composition API 兼容层。
-   ⏳ **`@ld/router`**: 路由系统。
-   ⏳ **`ld`**: 框架主入口包。

### 第四阶段：工具链

-   ⏳ **`@ld/vite-plugin`**: Vite 插件。
-   ⏳ **`@ld/cli`**: 命令行工具。
-   ⏳ **`@ld/devtools`**: 开发者工具。

## ⚡ 优化策略

### 架构优化

- 无虚拟DOM: 直接操作 DOM，减少中间层
- 信号驱动: 细粒度更新，最小化渲染
- Tree Shaking: 按需导入，最小打包体积
- ES Modules: 原生模块支持

### 性能优化

- AOT 编译: 提前编译，减少运行时开销
- 静态提升: 静态节点编译时提取
- 常量折叠: 编译时计算常量表达式
- 内存池: 对象复用，减少 GC 压力
- 全面缓存: 频繁计算的结果缓存
- 惰性求值: 延迟计算直到需要时

### 代码质量

- 100% 类型安全: 严格的 TypeScript 配置
- 零 Bug 原则: 完善的测试覆盖
- 内存安全: 自动资源清理
- 最小化包体积: 持续优化大小

## 📋 注意事项

### 开发规范

- 中文文档: 所有代码注释、JSDoc 和说明性文本必须使用中文
- 状态管理: 所有跨模块共享的内部状态必须在专用的 store.ts 模块中管理
- 全局 vs 实例状态: 明确区分全局状态（globalState）和实例状态（createInstanceStore）
- 类型安全: 禁止使用 any 类型，必须明确定义类型

### 测试要求

- **智能测试 (Intelligent Testing)**: `pnpm test` 和 `pnpm test:ai` 命令已实现智能化。它们会自动读取 `ai-generate-code-guidance.json` 文件，并只对 `modules.detailed` 中状态为 `completed` 或 `active` 的模块运行测试。这避免了对未开发模块的无效测试，保持了测试输出的清晰和专注。
- 测试驱动: 每个文件生成后必须立即生成/更新对应的测试文件
- 测试覆盖: 必须包含正常用例、边界用例和错误用例
- 失败验证: 先添加可能导致测试不通过的用例，修复后再继续
- 独立运行: 修改单个文件后只运行对应的测试文件

### 工作流程

- 依赖分析: 生成代码前必须分析现有模块导出和依赖关系
- 状态更新: 每次操作后必须立即更新配置文件中的当前状态
- 测试验证: 所有测试通过后才能继续下一步
- 文档同步: 模块完成后必须生成 README.md 和 rollup.config.js

## 🛠️ 开发命令

### 基础命令

```bash
# 开发模式
pnpm dev:all # 启动所有开发服务

# 构建
pnpm build:fast # 快速构建（跳过测试和类型检查）
pnpm build:prod # 生产构建

# 测试
pnpm test # 智能运行所有活动模块的测试
pnpm test:watch # 监听模式运行测试
pnpm test:coverage # 生成覆盖率报告
pnpm test:ui # 启动测试UI界面
```

### AI 开发专用命令

```bash
# AI测试运行器
pnpm test:ai # 智能运行活动模块的测试并生成AI报告
pnpm test:ai:results # 读取上次测试结果
node scripts/ai-test-helper.mts analyze # 分析测试失败原因
node scripts/ai-test-helper.mts check # 检查是否可以继续下一步

# 基准测试
pnpm bench # 运行所有基准测试
pnpm bench:reactivity # 运行响应式系统基准测试
pnpm bench:render # 运行渲染基准测试
pnpm bench:compiler # 运行编译基准测试
pnpm bench:memory # 运行内存基准测试
```

### 代码质量

```bash
# 代码检查
pnpm lint # ESLint检查
pnpm lint:fix # 自动修复ESLint问题
pnpm type-check # TypeScript类型检查

# 代码格式化
pnpm format # Prettier格式化代码
pnpm format:check # 检查代码格式

# 综合检查
pnpm check # 运行完整检查
pnpm ci # CI流程（lint + type-check + test + build）
```

## 🔍 模块依赖关系

```
reactivity (独立)
├── runtime-core
│ ├── runtime-dom
│ └── compiler-core
│ └── compiler-sfc
└── router
└── ld-main
├── vite-plugin
├── cli
└── devtools
```

## 📈 质量保证

### 测试覆盖率要求

- 语句覆盖率: ≥95%
- 分支覆盖率: ≥95%
- 函数覆盖率: ≥95%
- 行覆盖率: ≥95%

### 代码检查规则

- ESLint: @typescript-eslint/recommended 规则集
- 禁止 any: 必须使用明确定义的类型
- 无未使用变量: 所有声明必须被使用
- 导入导出规范: 统一导入导出格式

### 构建配置

- Rollup: 每个模块独立的 rollup.config.js
- 输出格式: ESM 和 CJS 双格式
- 类型生成: 独立的 .d.ts 类型声明文件
- 最小化: 生产环境代码压缩和优化

## 🚧 当前状态

-   **已完成模块**:
    -   `@ld/reactivity`
    -   `@ld/runtime-core`
    -   `@ld/runtime-dom`
-   **当前模块**: `@ld/runtime-jsx` (准备开始)
-   **核心运行时已稳定**: 响应式系统和浏览器渲染器已完成并通过所有测试。

**下一步:**

-   实现 `@ld/runtime-jsx` 模块，为使用 JSX/TSX 语法提供运行时支持。
-   开发 Babel 插件 `@ld/babel-plugin-ld`，将 JSX 编译为对 `@ld/runtime-jsx` 的调用。

## 🤝 贡献指南

### 开发流程

- 读取配置: 开发前必须仔细阅读 generate-code-guidance.json
- 依赖分析: 分析现有模块导出，确保依赖关系正确
- 代码生成: 按照配置生成高质量的 TypeScript 代码
- 测试验证: 立即运行测试，确保所有用例通过
- 文档更新: 更新相关文档和配置

### 提交规范

- 提交前: 必须通过所有测试和 lint 检查
- 提交信息: 使用中文描述，清晰说明变更内容
- 分支策略: feature/模块名-功能 分支命名

### 版本发布

- 语义化版本: 严格遵循 SemVer 规范
- 变更记录: 使用 Changesets 管理变更日志
- 自动发布: CI/CD 流程自动发布到 NPM

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

LD 框架 - 重新定义前端框架的性能极限，为下一代 Web 应用提供极致性能的解决方案。
