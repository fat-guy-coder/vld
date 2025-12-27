/**
 * @description Patches the `style` attribute.
 * @param el - The target element.
 * @param prevValue - The previous style value (string or object).
 * @param nextValue - The next style value (string or object).
 */
export function patchStyle(
  el: HTMLElement,
  prevValue: string | Record<string, string> | null,
  nextValue: string | Record<string, string> | null
) {
  const { style } = el;

  if (nextValue && typeof nextValue === 'string') {
    // If the new value is a string, set it directly
    style.cssText = nextValue;
    return;
  }

  // If there was an old style object, clear properties that are no longer present
  if (prevValue && typeof prevValue === 'object') {
    for (const key in prevValue) {
      if (nextValue == null || !(nextValue as Record<string, string>)[key]) {
        style[key as any] = '';
      }
    }
  }

  // Apply new styles from an object
  if (nextValue && typeof nextValue === 'object') {
    for (const key in nextValue) {
      style[key as any] = nextValue[key];
    }
  }
}

