/**
 * @description Patches DOM event listeners.
 * @param el - The target element.
 * @param rawName - The raw event name (e.g., 'onClick').
 * @param prevValue - The previous event handler.
 * @param nextValue - The next event handler.
 */
export function patchEvent(
  el: Element,
  rawName: string,
  prevValue: Function | null,
  nextValue: Function | null
) {
  // vei = vue event invokers
  const invokers = (el as any)._vei || ((el as any)._vei = {});
  const existingInvoker = invokers[rawName];

  if (nextValue && existingInvoker) {
    // An invoker already exists, just update its attached handler
    existingInvoker.value = nextValue;
  } else {
    const name = rawName.slice(2).toLowerCase();
    if (nextValue) {
      // Add new invoker
      const invoker = (invokers[rawName] = createInvoker(nextValue));
      el.addEventListener(name, invoker);
    } else if (existingInvoker) {
      // Remove existing invoker
      el.removeEventListener(name, existingInvoker);
      invokers[rawName] = undefined;
    }
  }
}

/**
 * @description Creates a wrapper function that allows the event handler to be updated without
 * needing to remove and re-add the event listener.
 * @param initialValue - The initial event handler function.
 * @returns A wrapper function (invoker).
 */
function createInvoker(initialValue: Function) {
  const invoker = (e: Event) => {
    invoker.value(e);
  };
  invoker.value = initialValue;
  return invoker;
}


