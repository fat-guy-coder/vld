import { describe, it, expect, vi } from 'vitest';
import { patchProp } from '../src/modules';

describe('runtime-dom/modules/patchProp', () => {
  let el: Element;

  beforeEach(() => {
    el = document.createElement('div');
  });

  // Test for patching attributes
  it('should patch attributes', () => {
    patchProp(el, 'id', null, 'test-id');
    expect(el.getAttribute('id')).toBe('test-id');
    patchProp(el, 'id', 'test-id', null);
    expect(el.getAttribute('id')).toBe(null);
  });

  // Test for patching class
  it('should patch class', () => {
    patchProp(el, 'class', null, 'class1 class2');
    expect(el.className).toBe('class1 class2');
    patchProp(el, 'class', 'class1 class2', null);
    expect(el.hasAttribute('class')).toBe(false);
  });

  // Test for patching style as a string
  it('should patch style as a string', () => {
    patchProp(el, 'style', null, 'color: red; font-size: 16px;');
    expect((el as HTMLElement).style.color).toBe('red');
    expect((el as HTMLElement).style.fontSize).toBe('16px');
  });

  // Test for patching style as an object
  it('should patch style as an object', () => {
    const prevStyle = { color: 'red' };
    const nextStyle = { fontSize: '16px' };
    patchProp(el, 'style', prevStyle, nextStyle);
    expect((el as HTMLElement).style.color).toBe(''); // Should remove old style
    expect((el as HTMLElement).style.fontSize).toBe('16px'); // Should add new style
  });

  // Test for patching event listeners
  it('should patch event listeners', () => {
    const handler = vi.fn();
    patchProp(el, 'onClick', null, handler);

    // Simulate a click event
    const event = new Event('click');
    el.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);

    // Test updating the handler
    const newHandler = vi.fn();
    patchProp(el, 'onClick', handler, newHandler);
    el.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1); // Old handler should not be called again
    expect(newHandler).toHaveBeenCalledTimes(1); // New handler should be called

    // Test removing the handler
    patchProp(el, 'onClick', newHandler, null);
    el.dispatchEvent(event);
    expect(newHandler).toHaveBeenCalledTimes(1); // Handler should not be called again
  });
});


