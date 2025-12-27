import { patchClass } from './class';
import { patchStyle } from './style';
import { patchAttr } from './attrs';
import { patchEvent } from './events';

/**
 * @description Patches a single property on a DOM element.
 * This function acts as a dispatcher, delegating to specialized patch functions
 * based on the property key.
 * @param el - The target element.
 * @param key - The property key.
 * @param prevValue - The previous value of the property.
 * @param nextValue - The next value of the property.
 */
export const patchProp = (el: Element, key: string, prevValue: any, nextValue: any) => {
  if (key === 'class') {
    patchClass(el, nextValue);
  } else if (key === 'style') {
    patchStyle(el as HTMLElement, prevValue, nextValue);
  } else if (/^on[^a-z]/.test(key)) {
    // Match event listeners (e.g., onClick, onMouseOver)
    patchEvent(el, key, prevValue, nextValue);
  } else {
    // Default to patching as an attribute
    patchAttr(el, key, nextValue);
  }
};


