/**
 * @description Patches standard HTML attributes.
 */
export function patchAttr(el: Element, key: string, nextValue: any) {
  if (nextValue == null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, nextValue);
  }
}


