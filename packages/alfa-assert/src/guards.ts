import { isDocument, isElement, Node } from "@siteimprove/alfa-dom";
import { Assertable } from "./types";

function isObject(value: unknown): value is { [key: string]: unknown } {
  return typeof value === "object" && value !== null;
}

function isNode(value: unknown): value is Node {
  return isObject(value) && typeof value.nodeType === "number";
}

export function isAssertable(value: unknown): value is Assertable {
  return isNode(value) && (isDocument(value) || isElement(value));
}
