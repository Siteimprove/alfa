import {
  Element,
  Text,
  isText,
  isElement,
  getAttribute,
  getRoot
} from "@alfa/dom";
import { getRole } from "@alfa/aria";
import { isVisible } from "./is-visible";
import { resolveReferences } from "./resolve-references";

/**
 * Get the computed accessible text alternative of an element.
 *
 * @see https://www.w3.org/TR/accname-aam-1.1/
 */
export function getTextAlternative(
  node: Element | Text,
  visited: Set<Element | Text> = new Set(),
  recursing: boolean = false,
  referencing: boolean = false
): string {
  if (visited.has(node)) {
    return "";
  }

  visited.add(node);

  // https://www.w3.org/TR/accname-aam-1.1/#step2A
  if (!isVisible(node) && !referencing) {
    return "";
  }

  // Perform the last step at this point in order to appease the type checker.
  // Otherwise, we might risk that we're not dealing with an element in the
  // remaining steps below.
  // https://www.w3.org/TR/accname-aam-1.1/#step2G
  if (isText(node)) {
    return node.value;
  }

  // https://www.w3.org/TR/accname-aam-1.1/#step2B
  const labelledBy = getAttribute(node, "aria-labelledby");
  if (labelledBy && !referencing) {
    const root = getRoot(node);

    if (root === null) {
      return "";
    }

    return resolveReferences(root, String(labelledBy))
      .map(element => getTextAlternative(element, visited, true, true))
      .join(" ");
  }

  // https://www.w3.org/TR/accname-aam-1.1/#step2C
  const label = getAttribute(node, "aria-label");
  if (label) {
    return String(label);
  }

  // https://www.w3.org/TR/accname-aam-1.1/#step2D

  // https://www.w3.org/TR/accname-aam-1.1/#step2E

  // https://www.w3.org/TR/accname-aam-1.1/#step2F
  const role = getRole(node);
  if (
    (role && role.label && role.label.from.indexOf("contents") !== -1) ||
    referencing ||
    isNativeTextAlternativeElement(node)
  ) {
    const subtree = node.children
      .map(child => {
        if (isElement(child) || isText(child)) {
          const text = getTextAlternative(child, visited, true, false);
          return text;
        }

        return null;
      })
      .filter(child => child !== null)
      .join(" ");

    if (subtree !== "") {
      return subtree;
    }
  }

  // https://www.w3.org/TR/accname-aam-1.1/#step2H
  const title = getAttribute(node, "title");
  if (title) {
    return String(title);
  }

  return "";
}

/**
 * Check if an element is a "native host language text alternative element".
 * The elements that qualify as such are defined in the HTML Accessibility
 * API Mappings specification as elements whose text alternative can be
 * computed from their subtree.
 *
 * @see https://www.w3.org/TR/html-aam-1.0/#accessible-name-and-description-computation
 */
function isNativeTextAlternativeElement(element: Element): boolean {
  switch (element.tag) {
    case "button":
    case "legend":
    case "output":
    case "summary":
    case "figure":
      return true;
  }

  return isTextLevelElement(element);
}

/**
 * @see https://www.w3.org/TR/html/textlevel-semantics.html
 * @see https://www.w3.org/TR/html-aam-1.0/#text-level-elements-not-listed-elsewhere
 */
function isTextLevelElement(element: Element): boolean {
  switch (element.tag) {
    case "a":
    case "em":
    case "strong":
    case "small":
    case "s":
    case "cite":
    case "q":
    case "dfn":
    case "abbr":
    case "time":
    case "code":
    case "var":
    case "samp":
    case "kbd":
    case "sub":
    case "sup":
    case "i":
    case "b":
    case "u":
    case "mark":
    case "ruby":
    case "rt":
    case "rp":
    case "bdi":
    case "bdo":
    case "br":
    case "wbr":
      return true;
  }

  return false;
}
