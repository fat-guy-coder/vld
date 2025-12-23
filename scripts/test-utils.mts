// scripts/test-utils.mts
import { existsSync } from 'fs'
import { resolve } from 'path'

/**
 * 测试工具函数
 */

// 获取项目根目录
export function getRootDir() {
    return resolve(process.cwd())
}

// 检查是否是开发环境
export function isDevelopment() {
    return process.env.NODE_ENV === 'development'
}

// 检查是否是测试环境
export function isTest() {
    return process.env.NODE_ENV === 'test' || process.env['VITEST'] === 'true'
}

// 检查是否是基准测试环境
export function isBenchmark() {
    return process.env['VITEST_BENCH'] === 'true'
}

// 获取包目录
export function getPackageDir(pkgName: string) {
    const rootDir = getRootDir()
    return resolve(rootDir, 'packages', pkgName)
}

// 检查包是否存在
export function packageExists(pkgName: string) {
    return existsSync(getPackageDir(pkgName))
}

// 生成测试报告目录
export function getReportDir() {
    const rootDir = getRootDir()
    return resolve(rootDir, 'reports')
}

// 生成覆盖率目录
export function getCoverageDir() {
    const rootDir = getRootDir()
    return resolve(rootDir, 'coverage')
}

export default {
    getRootDir,
    isDevelopment,
    isTest,
    isBenchmark,
    getPackageDir,
    packageExists,
    getReportDir,
    getCoverageDir
}