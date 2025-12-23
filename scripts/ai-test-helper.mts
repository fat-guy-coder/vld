#!/usr/bin/env node
// scripts/ai-test-helper.mts
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')

const AI_TEST_RESULT_FILE = resolve(rootDir, '.ai-test-result.json')

/**
 * AI测试辅助工具
 * 为AI提供测试结果分析和下一步建议
 */

interface TestFailure {
    name: string
    error: string
    file: string
}

interface AITestResult {
    success: boolean
    totalTests: number
    passedTests: number
    failedTests: number
    failures: TestFailure[]
    summary: string
    timestamp: string
}

/**
 * 读取最近的测试结果
 */
export function getLatestTestResult(): AITestResult | null {
    if (!existsSync(AI_TEST_RESULT_FILE)) {
        return null
    }

    try {
        const content = readFileSync(AI_TEST_RESULT_FILE, 'utf-8')
        return JSON.parse(content)
    } catch (error) {
        console.error('读取测试结果失败:', error)
        return null
    }
}

/**
 * 分析测试失败原因
 */
export function analyzeFailures(failures: TestFailure[]): {
    categories: Array<{
        type: 'syntax' | 'type' | 'logic' | 'runtime' | 'unknown'
        count: number
        examples: string[]
    }>
    suggestions: string[]
} {
    const categories = {
        syntax: { type: 'syntax' as const, count: 0, examples: [] },
        type: { type: 'type' as const, count: 0, examples: [] },
        logic: { type: 'logic' as const, count: 0, examples: [] },
        runtime: { type: 'runtime' as const, count: 0, examples: [] },
        unknown: { type: 'unknown' as const, count: 0, examples: [] }
    }

    const suggestions: string[] = []

    failures.forEach(failure => {
        const error = failure.error.toLowerCase()

        if (error.includes('syntax') || error.includes('parse') || error.includes('token')) {
            categories.syntax.count++
            categories.syntax.examples.push(failure.name as never)
            suggestions.push(`检查 ${failure.file} 的语法错误`)
        }
        else if (error.includes('type') || error.includes('ts') || error.includes('typescript')) {
            categories.type.count++
            categories.type.examples.push(failure.name as never)
            suggestions.push(`修复 ${failure.file} 的类型错误`)
        }
        else if (error.includes('not defined') || error.includes('undefined') || error.includes('null')) {
            categories.runtime.count++
            categories.runtime.examples.push(failure.name as never)
            suggestions.push(`检查 ${failure.file} 中的变量定义`)
        }
        else if (error.includes('expected') || error.includes('actual') || error.includes('assert')) {
            categories.logic.count++
            categories.logic.examples.push(failure.name as never)
            suggestions.push(`重新检查 ${failure.name} 的逻辑`)
        }
        else {
            categories.unknown.count++
            categories.unknown.examples.push(failure.name as never)
            suggestions.push(`分析 ${failure.name} 的详细错误`)
        }
    })

    return {
        categories: Object.values(categories).filter(cat => cat.count > 0),
        suggestions: [...new Set(suggestions)] // 去重
    }
}

/**
 * 生成修复建议
 */
export function generateFixSuggestions(result: AITestResult): string[] {
    const suggestions: string[] = []

    if (result.success) {
        suggestions.push('✅ 所有测试通过！可以继续生成下一个文件')
        return suggestions
    }

    if (result.failedTests === 0 && !result.success) {
        suggestions.push('⚠️ 测试运行有错误，但没有具体失败用例')
        suggestions.push('检查测试配置或运行环境')
        return suggestions
    }

    const analysis = analyzeFailures(result.failures)

    suggestions.push(`🔍 发现 ${result.failedTests} 个测试失败`)

    analysis.categories.forEach(cat => {
        if (cat.count > 0) {
            suggestions.push(`   ${cat.type} 错误: ${cat.count} 个`)
            if (cat.examples.length > 0) {
                suggestions.push(`   示例: ${cat.examples.slice(0, 2).join(', ')}${cat.examples.length > 2 ? '...' : ''}`)
            }
        }
    })

    // 添加具体修复建议
    analysis.suggestions.forEach(suggestion => {
        suggestions.push(`💡 ${suggestion}`)
    })

    // 通用建议
    suggestions.push('📝 建议步骤:')
    suggestions.push('  1. 检查错误信息定位问题')
    suggestions.push('  2. 修改相关代码文件')
    suggestions.push('  3. 再次运行测试验证修复')
    suggestions.push('  4. 如果仍失败，尝试添加更多调试信息')

    return suggestions
}

/**
 * 检查是否可以继续生成下一个文件
 */
export function canContinueToNextFile(): {
    canContinue: boolean
    reason: string
    requiredActions?: string[]
} {
    const result = getLatestTestResult()

    if (!result) {
        return {
            canContinue: false,
            reason: '未找到测试结果，请先运行测试',
            requiredActions: ['运行 pnpm test:ai']
        }
    }

    if (!result.success) {
        return {
            canContinue: false,
            reason: `有 ${result.failedTests} 个测试失败`,
            requiredActions: generateFixSuggestions(result)
        }
    }

    return {
        canContinue: true,
        reason: '所有测试通过',
        requiredActions: ['可以继续生成下一个文件']
    }
}

// 命令行接口
if (import.meta.url === `file://${process.argv[1]}`) {
    const command = process.argv[2]

    switch (command) {
        case 'analyze':
            const result = getLatestTestResult()
            if (result) {
                console.log('📊 测试结果分析:')
                console.log(JSON.stringify(result, null, 2))

                console.log('\n🔍 失败分析:')
                const analysis = analyzeFailures(result.failures)
                console.log(JSON.stringify(analysis, null, 2))

                console.log('\n💡 修复建议:')
                generateFixSuggestions(result).forEach(s => console.log(`  ${s}`))
            } else {
                console.log('⚠️ 没有找到测试结果')
            }
            break

        case 'check':
            const check = canContinueToNextFile()
            console.log('🔍 是否可以继续生成下一个文件:')
            console.log(`  ${check.canContinue ? '✅ 可以' : '❌ 不可以'}`)
            console.log(`  原因: ${check.reason}`)
            if (check.requiredActions) {
                console.log('\n📋 需要执行的操作:')
                check.requiredActions.forEach(action => console.log(`  • ${action}`))
            }
            break

        case 'summary':
            const summaryResult = getLatestTestResult()
            if (summaryResult) {
                console.log('📋 测试结果摘要:')
                console.log(`  ✅ 成功: ${summaryResult.success}`)
                console.log(`  📊 总计: ${summaryResult.totalTests}`)
                console.log(`  👍 通过: ${summaryResult.passedTests}`)
                console.log(`  👎 失败: ${summaryResult.failedTests}`)
                console.log(`  ⏱️  时间: ${new Date(summaryResult.timestamp).toLocaleString()}`)
                console.log(`  📝 总结: ${summaryResult.summary}`)
            } else {
                console.log('⚠️ 没有找到测试结果')
            }
            break

        default:
            console.log('使用方法:')
            console.log('  analyze - 分析测试结果')
            console.log('  check   - 检查是否可以继续')
            console.log('  summary - 显示测试摘要')
            break
    }
}

// 导出供其他脚本使用
export default {
    getLatestTestResult,
    analyzeFailures,
    generateFixSuggestions,
    canContinueToNextFile
}