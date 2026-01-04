import { describe, it, expect } from 'vitest';
import { parseScript } from '../src/script-parser';

describe('V5 Script Parser', () => {
  it('should parse `s:` and `c:` macros', () => {
    const source = `
      s: count = 0;
      c: doubled = count * 2;
    `;
    const { macros } = parseScript(source);

    expect(macros).toHaveLength(2);

    const signalMacro = macros.find(m => m.type === 'signal');
    expect(signalMacro).toBeDefined();
    expect(signalMacro?.name).toBe('count');

    const computedMacro = macros.find(m => m.type === 'computed');
    expect(computedMacro).toBeDefined();
    expect(computedMacro?.name).toBe('doubled');
  });

  it('should parse full `signal:` and `computed:` macros', () => {
    const source = `
      signal: count = 10;
      computed: isPositive = count > 0;
    `;
    const { macros } = parseScript(source);

    expect(macros).toHaveLength(2);
    expect(macros[0].type).toBe('signal');
    expect(macros[1].type).toBe('computed');
  });

  it('should parse the `effect` macro with dependencies', () => {
    const source = `
      effect(() => {
        console.log(count);
      }, [count]);
    `;
    const { macros } = parseScript(source);

    expect(macros).toHaveLength(1);
    const effectMacro = macros[0];

    expect(effectMacro.type).toBe('effect');
    expect(effectMacro.effectFn).toBeDefined();
    expect(effectMacro.deps).toBeDefined();
    expect(effectMacro.deps?.elements).toHaveLength(1);
  });

  it('should parse the `effect` macro without dependencies', () => {
    const source = `
      effect(() => {
        console.log('Runs once');
      });
    `;
    const { macros } = parseScript(source);

    expect(macros).toHaveLength(1);
    const effectMacro = macros[0];

    expect(effectMacro.type).toBe('effect');
    expect(effectMacro.deps).toBeUndefined();
  });

  it('should parse a combination of all V5 macros', () => {
    const source = `
      import { something } from 'somewhere';

      s: count = 0;

      function increment() {
        count = count + 1;
      }

      c: isEven = count % 2 === 0;

      effect(() => {
        console.log(isEven);
      }, [isEven]);
    `;
    const { macros } = parseScript(source);

    expect(macros).toHaveLength(3);
    expect(macros.filter(m => m.type === 'signal')).toHaveLength(1);
    expect(macros.filter(m => m.type === 'computed')).toHaveLength(1);
    expect(macros.filter(m => m.type === 'effect')).toHaveLength(1);
  });
});

