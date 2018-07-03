import { Element, Node } from "@siteimprove/alfa-dom";
import { getTextAlternative } from "./get-text-alternative";

export function hasTextAlternative(element: Element, context: Node): boolean {
  return getTextAlternative(element, context) !== null;
}
