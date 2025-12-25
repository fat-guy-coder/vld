/**
 * Vite 插件：开发控制台
 * @description 提供 API 端点来读取和执行所有包的 index.ts 文件，支持依赖解析
 */

import type { Plugin } from 'vite'
import { readdir, readFile, stat } from 'fs/promises'
import { join, resolve, dirname, relative } from 'path'

// 注意：使用 process.cwd() 获取项目根目录，而不是基于文件路径计算
// 这样可以确保在 Vite 服务器运行时获取正确的路径

interface PackageInfo {
  name: string
  path: string
  code: string
}

interface DependencyInfo {
  path: string
  code: string
  exports: Record<string, any>
  isSideEffect: boolean // 是否是副作用导入（import './file'）
}

/**
 * 获取所有包的 index.ts 文件
 */
async function getPackages(): Promise<PackageInfo[]> {
  const packages: PackageInfo[] = []

  try {
    const actualRootDir = process.cwd()
    const actualPackagesDir = resolve(actualRootDir, 'packages')
    
    const entries = await readdir(actualPackagesDir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const indexPath = join(actualPackagesDir, entry.name, 'src', 'index.ts')
        
        try {
          await stat(indexPath)
          const code = await readFile(indexPath, 'utf-8')
          packages.push({
            name: entry.name,
            path: indexPath,
            code,
          })
        } catch {
          // 文件不存在，跳过
        }
      }
    }
  } catch (error) {
    console.error('[Dev Console] 读取包列表失败:', error)
  }

  return packages
}

/**
 * 解析 import 语句，提取依赖路径
 */
function parseImports(code: string, baseDir: string): Array<{ path: string; isSideEffect: boolean; imports: string[] }> {
  const imports: Array<{ path: string; isSideEffect: boolean; imports: string[] }> = []
  
  // 匹配 import 语句
  const importRegex = /import\s+(?:(?:\*\s+as\s+\w+)|(?:\{[^}]*\})|(?:\w+)|(?:\w+\s*,\s*\{[^}]*\}))\s+from\s+['"]([^'"]+)['"]/g
  const sideEffectRegex = /import\s+['"]([^'"]+)['"]/g
  
  // 匹配副作用导入 import './file'
  let match
  while ((match = sideEffectRegex.exec(code)) !== null) {
    const importPath = match[1]
    if (!importPath?.startsWith('.')) continue // 只处理相对路径
    
    const fullPath = resolveImportPath(importPath, baseDir)
    imports.push({
      path: fullPath,
      isSideEffect: true,
      imports: [],
    })
  }
  
  // 匹配命名导入 import { x } from './file'
  while ((match = importRegex.exec(code)) !== null) {
    const importPath = match[1]
    if (!importPath?.startsWith('.')) continue // 只处理相对路径
    
    const fullPath = resolveImportPath(importPath, baseDir)
    const importSpec = match[0]
    
    // 提取导入的名称
    const namedImports: string[] = []
    if (importSpec) {
      const namedMatch = importSpec.match(/\{([^}]+)\}/)
      if (namedMatch && namedMatch[1]) {
        namedImports.push(...namedMatch[1].split(',').map(s => {
          const trimmed = s.trim()
          return trimmed.split(' as ')[0] || trimmed
        }).filter(Boolean))
      }
    }
    
    imports.push({
      path: fullPath,
      isSideEffect: false,
      imports: namedImports,
    })
  }
  
  return imports
}

/**
 * 解析导入路径为绝对路径
 */
function resolveImportPath(importPath: string, baseDir: string): string {
  // 移除扩展名，添加 .ts
  let resolved = importPath
  if (!resolved.endsWith('.ts')) {
    resolved = resolved + '.ts'
  }
  
  // 解析为绝对路径
  return resolve(baseDir, resolved)
}

/**
 * 递归收集所有依赖
 */
async function collectDependencies(
  filePath: string,
  baseDir: string,
  visited: Set<string> = new Set()
): Promise<Map<string, DependencyInfo>> {
  const deps = new Map<string, DependencyInfo>()
  
  if (visited.has(filePath)) {
    return deps
  }
  visited.add(filePath)
  
  try {
    const code = await readFile(filePath, 'utf-8')
    const fileDir = dirname(filePath)
    const imports = parseImports(code, fileDir)
    
    // 添加当前文件
    deps.set(filePath, {
      path: filePath,
      code,
      exports: {},
      isSideEffect: false,
    })
    
    // 递归处理依赖
    for (const imp of imports) {
      try {
        await stat(imp.path)
        const subDeps = await collectDependencies(imp.path, baseDir, visited)
        subDeps.forEach((dep, path) => {
          if (!deps.has(path)) {
            deps.set(path, dep)
          }
        })
      } catch {
        // 文件不存在，跳过
      }
    }
  } catch (error) {
    console.error(`[Dev Console] 读取文件失败 ${filePath}:`, error)
  }
  
  return deps
}

/**
 * 使用 Vite 转换模块并构建完整的模块系统
 */
async function transformWithDependencies(
  _code: string,
  moduleName: string,
  _server: any
): Promise<{ code: string; dependencies: Map<string, string> }> {
  const actualRootDir = process.cwd()
  const actualPackagesDir = resolve(actualRootDir, 'packages')
  const indexPath = join(actualPackagesDir, moduleName, 'src', 'index.ts')
  const baseDir = dirname(indexPath)
  
  // 收集所有依赖
  const dependencies = await collectDependencies(indexPath, baseDir)
  
  // 使用 esbuild 转换所有模块
  const esbuild = await import('esbuild')
  const transformedModules = new Map<string, string>()
  
  for (const [path, dep] of dependencies) {
    try {
      const transformed = await esbuild.transform(dep.code, {
        loader: 'ts',
        target: 'esnext',
        format: 'cjs', // 使用 CommonJS 格式，这样会自动转换 import/export
        sourcemap: false,
      })
      transformedModules.set(path, transformed.code)
    } catch (error) {
      console.error(`[Dev Console] 转换失败 ${path}:`, error)
    }
  }
  
  // 构建模块系统代码
  const moduleSystem = buildModuleSystem(transformedModules, indexPath, baseDir)
  
  return {
    code: moduleSystem,
    dependencies: transformedModules,
  }
}

/**
 * 构建模块系统，将所有模块包装在一个可执行的系统中
 */
function buildModuleSystem(modules: Map<string, string>, _entryPath: string, baseDir: string): string {
  const moduleCode: string[] = []
  const moduleMap = new Map<string, string>()
  
  // 为每个模块创建模块 ID
  modules.forEach((code, path) => {
    const relativePath = relative(baseDir, path).replace(/\\/g, '/').replace(/\.ts$/, '')
    // 移除开头的 ./ 或 .\，统一使用相对路径作为模块 ID
    let moduleId = relativePath || 'index'
    if (moduleId.startsWith('./')) {
      moduleId = moduleId.substring(2)
    }
    if (moduleId.startsWith('.\\')) {
      moduleId = moduleId.substring(2)
    }
    moduleMap.set(path, moduleId)
    
    // 替换代码中的 require 路径，将相对路径转换为模块 ID
    let processedCode = code
    // 替换 require('./file') 为 require('file')
    processedCode = processedCode.replace(/require\(['"]\.\/([^'"]+)['"]\)/g, (_match, filePath) => {
      const cleanPath = filePath.replace(/\.ts$/, '')
      return `require('${cleanPath}')`
    })
    
    moduleCode.push(`  '${moduleId}': function(module, exports, require) {\n${processedCode}\n  },`)
  })
  
  // 构建完整的模块系统
  return `
(function() {
  const modules = {
${moduleCode.join('\n')}
  };
  
  const cache = {};
  
  function require(moduleId) {
    if (cache[moduleId]) {
      return cache[moduleId].exports;
    }
    
    const module = { exports: {} };
    cache[moduleId] = module;
    
    if (modules[moduleId]) {
      modules[moduleId](module, module.exports, require);
    }
    
    return module.exports;
  }
  
  // 执行入口模块
  require('index');
})();
`.trim()
}

export function vitePluginDevConsole(): Plugin {
  return {
    name: 'vite-plugin-dev-console',
    configureServer(server) {
      // API: 获取所有包列表
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/packages' && req.method === 'GET') {
          getPackages()
            .then(packages => {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(packages.map(p => ({ name: p.name, path: p.path }))))
            })
            .catch(error => {
              res.statusCode = 500
              res.end(JSON.stringify({ error: String(error) }))
            })
        } else {
          next()
        }
      })

      // API: 获取指定包的代码
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/api/package/') && req.method === 'GET') {
          const packageName = decodeURIComponent(req.url.replace('/api/package/', ''))
          
          getPackages()
            .then(packages => {
              const pkg = packages.find(p => p.name === packageName)
              
              if (pkg) {
                return readFile(pkg.path, 'utf-8').then(code => {
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ name: pkg.name, path: pkg.path, code }))
                })
              } else {
                res.statusCode = 404
                res.end(JSON.stringify({ error: 'Package not found' }))
                return Promise.resolve()
              }
            })
            .catch(error => {
              res.statusCode = 500
              res.end(JSON.stringify({ error: String(error) }))
            })
        } else {
          next()
        }
      })

      // API: 转换 TS 代码为 JS（包含依赖）
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/transform' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk.toString()
          })
          req.on('end', async () => {
            try {
              const { code, moduleName } = JSON.parse(body)
              
              // 使用依赖解析和转换
              const result = await transformWithDependencies(code, moduleName, server)

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ 
                code: result.code,
                dependencies: Object.fromEntries(result.dependencies)
              }))
            } catch (error) {
              res.statusCode = 500
              res.end(JSON.stringify({ 
                error: error instanceof Error ? error.message : String(error) 
              }))
            }
          })
        } else {
          next()
        }
      })
    },
  }
}
