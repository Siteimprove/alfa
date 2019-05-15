import { Element, hasAttribute } from "@siteimprove/alfa-dom";

export function hasLanguageAttribute(element: Element): boolean {
  return hasAttribute(element, "lang") || hasAttribute(element, "xml:lang");
}
