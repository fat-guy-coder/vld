/**
 * @description DOM-specific node operations.
 */
export const nodeOps = {
  /**
   * @description Inserts an element into the DOM.
   * @param child - The element to insert.
   * @param parent - The parent element.
   * @param anchor - The element to insert before. If null, appends to the end.
   */
  insert: (child: Node, parent: Node, anchor: Node | null = null) => {
    parent.insertBefore(child, anchor);
  },

  /**
   * @description Removes an element from the DOM.
   * @param child - The element to remove.
   */
  remove: (child: Node) => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },

  /**
   * @description Creates a DOM element.
   * @param tag - The tag name of the element.
   * @returns The created element.
   */
  createElement: (tag: string): Element => {
    return document.createElement(tag);
  },

  /**
   * @description Creates a text node.
   * @param text - The text content.
   * @returns The created text node.
   */
  createText: (text: string): Text => {
    return document.createTextNode(text);
  },

  /**
   * @description Sets the text content of a node.
   * @param node - The target node.
   * @param text - The new text content.
   */
  setText: (node: Node, text: string) => {
    node.textContent = text;
  },
};


