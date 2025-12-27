import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';

const packageName = 'ld-runtime-core';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: `dist/${packageName}.esm.js`,
        format: 'es',
        sourcemap: true,
      },
      {
        file: `dist/${packageName}.cjs.js`,
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
      }),
    ],
    external: ['@ld/reactivity'], // Mark reactivity as an external dependency
  },
  {
    input: 'src/index.ts',
    output: {
      file: `dist/types/index.d.ts`,
      format: 'es',
    },
    plugins: [dts()],
    external: ['@ld/reactivity'], // Also exclude from the type definitions bundle
  },
];



