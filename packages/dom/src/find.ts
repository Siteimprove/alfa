import { ParentNode, Element } from "./types";
import { isElement } from "./guards";
import { matches } from "./matches";
import { traverse, TraverseOptions } from "./traverse";

export type FindOptions = TraverseOptions;

export function find(
  context: ParentNode,
  selector: string,
  options: FindOptions = {}
): Element | null {
  let element: Element | null = null;

  traverse(
    context,
    node => {
      if (element !== null) {
        return false;
      }

      if (isElement(node) && matches(node, selector)) {
        element = node;
      }
    },
    options
  );

  return element;
}

export function findAll(
  context: ParentNode,
  selector: string,
  options: FindOptions = {}
): Array<Element> {
  const elements: Array<Element> = [];

  traverse(
    context,
    node => {
      if (isElement(node) && matches(node, selector)) {
        elements.push(node);
      }
    },
    options
  );

  return elements;
}
