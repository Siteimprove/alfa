import { Element, getParentNode, Node } from "@siteimprove/alfa-dom";
import { ElementChecker } from "./element-checker";

const isHTML = new ElementChecker().withName("html").build();

export function isDocumentElement(element: Element, context: Node): boolean {
  return isHTML(element) && getParentNode(element, context) === context;
}
