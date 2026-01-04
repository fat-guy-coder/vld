import { describe, it, expect } from 'vitest';
import { parseScript } from '../src/script-parser';
import { compileScript } from '../src/script-compiler';

describe('V5 Script Compiler', () => {
  it('should transform `s:` and `c:` macros', () => {
    const source = `
      s: count = 0;
      c: doubled = count * 2;
    `;
    const { ast, macros } = parseScript(source);
    const compiledCode = compileScript(ast, macros);

    expect(compiledCode).toContain('const count = createSignal(0);');
    expect(compiledCode).toContain('const doubled = computed(() => count() * 2);');
  });

  it('should transform the `effect` macro', () => {
    const source = `
      s: count = 0;
      effect(() => {
        console.log(count);
      }, [count]);
    `;
    const { ast, macros } = parseScript(source);
    const compiledCode = compileScript(ast, macros);

    expect(compiledCode).toContain('createEffect(() => {');
    expect(compiledCode).toContain('console.log(count());');
    expect(compiledCode).toContain('}, [count()]);');
  });

  it('should unwrap signal reads (Identifier)', () => {
    const source = `
      s: count = 0;
      console.log(count);
    `;
    const { ast, macros } = parseScript(source);
    const compiledCode = compileScript(ast, macros);

    expect(compiledCode).toContain('console.log(count());');
  });

  it('should unwrap signal writes (AssignmentExpression)', () => {
    const source = `
      s: count = 0;
      count = 5;
    `;
    const { ast, macros } = parseScript(source);
    const compiledCode = compileScript(ast, macros);

    expect(compiledCode).toContain('count(5);');
  });

  it('should handle complex assignment and unwrapping', () => {
    const source = `
      s: count = 0;
      function increment() {
        count = count + 1;
      }
    `;
    const { ast, macros } = parseScript(source);
    const compiledCode = compileScript(ast, macros);

    expect(compiledCode).toContain('count(count() + 1);');
  });

  it('should not unwrap in function declarations or object keys', () => {
    const source = `
      s: count = 0;
      function log(count) { // parameter
        console.log(count);
      }
      const obj = { count: 1 }; // object key
    `;
    const { ast, macros } = parseScript(source);
    const compiledCode = compileScript(ast, macros);

    expect(compiledCode).toContain('function log(count)');
    // Using a template literal to correctly handle the multi-line string.
    expect(compiledCode).toContain(`const obj = {\n  count: 1\n};`);
  });
});
