import { Element } from "./types";
import { getAttribute } from "./get-attribute";

export function hasAttribute(element: Element, name: string): boolean {
  return getAttribute(element, name) !== null;
}
