import { describe, it, expect } from 'vitest';
import { parse } from '../src/parse';

describe('Template Parser', () => {
  it('should return a root node for a simple template', () => {
    const template = '<div>hello</div>';
    const ast = parse(template);

    expect(ast).toBeDefined();
    expect(ast.type).toBe('Root');
    // Initially, the children will be empty as the parser is a placeholder
    expect(ast.children).toEqual([]);
  });
});

