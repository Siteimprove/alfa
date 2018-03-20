import { ParentNode, Element } from "./types";
import { isElement } from "./guards";
import { matches } from "./matches";
import { traverse } from "./traverse";

export function find(context: ParentNode, selector: string): Element | null {
  let element: Element | null = null;

  traverse(context, node => {
    if (element !== null) {
      return false;
    }

    if (isElement(node) && matches(node, selector)) {
      element = node;
    }
  });

  return element;
}

export function findAll(context: ParentNode, selector: string): Array<Element> {
  const elements: Array<Element> = [];

  traverse(context, node => {
    if (isElement(node) && matches(node, selector)) {
      elements.push(node);
    }
  });

  return elements;
}
