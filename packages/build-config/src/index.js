import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { dts } from 'rollup-plugin-dts';

/**
 * 通用的 Rollup 配置生成器 (ESM-only)。
 * @param {string} input  入口文件
 * @param {string} name   包名（用于输出文件名）
 * @param {object} [options]
 * @param {boolean} [options.generateTypes=true] 是否生成 d.ts
 * @returns {import('rollup').RollupOptions[]}
 */
export function createRollupConfig(input, name, options = {}) {
  const { generateTypes = true } = options;
  const basePlugins = [
    typescript({ tsconfig: './tsconfig.json' }),
  ];

  const configs = [
    // 未压缩版本
    {
      input,
      output: {
        file: `dist/${name}.esm.js`,
        format: 'es',
        sourcemap: true,
      },
      plugins: basePlugins,
    },
    // 压缩版本
    {
      input,
      output: {
        file: `dist/${name}.esm.min.js`,
        format: 'es',
        sourcemap: true,
      },
      plugins: [
        ...basePlugins,
        terser(),
      ],
    },
  ];

  if (generateTypes) {
    configs.push({
      input,
      output: {
        file: `dist/types/index.d.ts`,
        format: 'es',
      },
      plugins: [dts()],
    });
  }

  return configs;
}
