import { describe, it, expect } from 'vitest';
import { parse } from '../src/parse';

describe('SFC Parser', () => {
  it('should parse a simple .ld file with all blocks', () => {
    const source = `
      <script>
        const msg = 'hello';
      </script>

      <template>
        <h1>{msg}</h1>
      </template>

      <style>
        h1 { color: red; }
      </style>
    `;

    const descriptor = parse(source);

    expect(descriptor.script).not.toBeNull();
    expect(descriptor.script?.content).toContain("const msg = 'hello';");

    expect(descriptor.template).not.toBeNull();
    expect(descriptor.template?.content).toContain('<h1>{msg}</h1>');

    expect(descriptor.style).not.toBeNull();
    expect(descriptor.style?.content).toContain('h1 { color: red; }');
  });

  it('should parse attributes on blocks', () => {
    const source = `
      <script lang="ts" setup>
        const count = createSignal(0);
      </script>

      <style scoped>
        .counter { color: blue; }
      </style>
    `;

    const descriptor = parse(source);

    expect(descriptor.script).not.toBeNull();
    expect(descriptor.script?.attrs.lang).toBe('ts');
    expect(descriptor.script?.attrs.setup).toBe(true);

    expect(descriptor.template).toBeNull();

    expect(descriptor.style).not.toBeNull();
    expect(descriptor.style?.attrs.scoped).toBe(true);
  });

  it('should handle missing blocks gracefully', () => {
    const source = `<template><div>Just a template</div></template>`;
    const descriptor = parse(source);

    expect(descriptor.script).toBeNull();
    expect(descriptor.style).toBeNull();
    expect(descriptor.template).not.toBeNull();
    expect(descriptor.template?.content).toContain('<div>Just a template</div>');
  });

  it('should handle empty input', () => {
    const descriptor = parse('');
    expect(descriptor.script).toBeNull();
    expect(descriptor.template).toBeNull();
    expect(descriptor.style).toBeNull();
  });
});

