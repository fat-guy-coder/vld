import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '../..');

interface ModuleDetails {
  status: 'completed' | 'active' | 'pending';
  [key: string]: any;
}

interface GuidanceFile {
  modules: {
    detailed: Record<string, ModuleDetails>;
    [key: string]: any;
  };
}

/**
 * @description Reads the AI guidance file and returns a list of active or completed package paths.
 * This allows test runners to only focus on relevant modules.
 * @returns An array of package paths (e.g., ['packages/reactivity', 'packages/runtime-core']).
 */
export function getActivePackages(): string[] {
  const guidanceFilePath = resolve(rootDir, 'ai-generate-code-guidance/generate-code-guidance.json');
  try {
    const fileContent = readFileSync(guidanceFilePath, 'utf-8');
    const guidance = JSON.parse(fileContent) as GuidanceFile;

    const activePackages = Object.entries(guidance.modules.detailed)
      .filter(([, details]) => details.status === 'completed' || details.status === 'active')
      .map(([name]) => `packages/${name}`);

    if (activePackages.length === 0) {
      console.warn('⚠️ No active or completed packages found in guidance file. Testing all packages as a fallback.');
      return ['packages/*'];
    }

    console.log('🔍 Found active/completed packages for testing:', activePackages);
    return activePackages;

  } catch (error) {
    console.error('❌ Error reading or parsing guidance file:', error);
    console.warn('⚠️ Falling back to testing all packages.');
    return ['packages/*'];
  }
}



