// scripts/utils.mts
import { readFileSync } from 'fs';
import { resolve } from 'path';

const rootDir = resolve(process.cwd());

/**
 * @description Reads the AI guidance file and returns a list of modules that are ready for testing.
 * A module is considered testable if its status is 'completed' or 'active'.
 * @returns An array of absolute paths to the testable modules.
 */
export function getTestableModulePaths(): string[] {
  const guidancePath = resolve(rootDir, 'ai-generate-code-guidance', 'generate-code-guidance.json');
  try {
    const guidanceContent = readFileSync(guidancePath, 'utf-8');
    const guidance = JSON.parse(guidanceContent);

    const testableModules: string[] = [];
    const detailedModules = guidance.modules?.detailed || {};

    for (const moduleName in detailedModules) {
      const moduleInfo = detailedModules[moduleName];
      if (moduleInfo.status === 'completed' || moduleInfo.status === 'active') {
        testableModules.push(resolve(rootDir, 'packages', moduleName));
      }
    }

    // Fallback in case the detailed section is missing, test at least the current module
    if (testableModules.length === 0 && guidance.current?.module?.id) {
        testableModules.push(resolve(rootDir, 'packages', guidance.current.module.id));
    }

    return testableModules;

  } catch (error) {
    console.error('Error reading or parsing guidance file:', error);
    // Fallback to testing all packages if guidance is unavailable
    return [resolve(rootDir, 'packages', '*')];
  }
}

