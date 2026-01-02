import { createRequire } from 'module';
import { createRollupConfig } from '@ld/build-config';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

// 从 @ld/reactivity 中提取 reactivity
const packageName = pkg.name.split('/')[1];

export default createRollupConfig('src/index.ts', packageName);
