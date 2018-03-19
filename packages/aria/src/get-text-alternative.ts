import {
  Element,
  Text,
  isText,
  isElement,
  find,
  getAttribute,
  getRoot,
  getText
} from "@alfa/dom";
import { includes } from "@alfa/util";
import * as Roles from "./roles";
import { getRole } from "./get-role";
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
): string | null {
  if (visited.has(node)) {
    return null;
  }

  visited.add(node);

  // https://www.w3.org/TR/accname-aam-1.1/#step2A
  if (!isVisible(node) && !referencing) {
    return null;
  }

  // Perform the last step at this point in order to appease the type checker.
  // Otherwise, we might risk that we're not dealing with an element in the
  // remaining steps below.
  // https://www.w3.org/TR/accname-aam-1.1/#step2G
  if (isText(node)) {
    return flatten(node.data) || null;
  }

  // https://www.w3.org/TR/accname-aam-1.1/#step2B
  const labelledBy = getAttribute(node, "aria-labelledby");
  if (labelledBy && labelledBy !== "aria-labelledby" && !referencing) {
    const root = getRoot(node);

    if (root !== null) {
      const references = resolveReferences(root, String(labelledBy)).map(
        element => getTextAlternative(element, visited, true, true)
      );

      if (references.length > 0) {
        return flatten(references.join(" "));
      }
    }
  }

  // https://www.w3.org/TR/accname-aam-1.1/#step2C
  const label = getAttribute(node, "aria-label");
  if (label && label !== "aria-label") {
    return flatten(label);
  }

  const role = getRole(node);

  // https://www.w3.org/TR/accname-aam-1.1/#step2D
  if (role !== Roles.Presentation && role !== Roles.None) {
    const native = getNativeTextAlternative(node);
    if (native !== null) {
      return flatten(native);
    }
  }

  // https://www.w3.org/TR/accname-aam-1.1/#step2E
  if (isEmbeddedControl(node, referencing)) {
    switch (role) {
      case Roles.TextBox:
        switch (node.tagName) {
          case "input":
          case "textarea":
            const value = getAttribute(node, "value");
            if (typeof value === "string" && value) {
              return flatten(value);
            }
            break;
          default:
            return getText(node);
        }

      case Roles.Button:
        return getTextAlternative(node, visited, true, false);
    }
  }

  // https://www.w3.org/TR/accname-aam-1.1/#step2F
  if (
    (role && role.label && includes(role.label.from, "contents")) ||
    referencing ||
    isNativeTextAlternativeElement(node)
  ) {
    const children = node.childNodes
      .map(
        child =>
          isElement(child) || isText(child)
            ? getTextAlternative(child, visited, true, false)
            : null
      )
      .filter(child => child !== null);

    if (children.length > 0) {
      return flatten(children.join(" "));
    }
  }

  // https://www.w3.org/TR/accname-aam-1.1/#step2H
  const title = getAttribute(node, "title");
  if (typeof title === "string" && title) {
    return flatten(title);
  }

  return null;
}

/**
 * Return a flattened and trimmed version of a string.
 *
 * @see https://www.w3.org/TR/accname-aam-1.1/#terminology
 */
function flatten(string: string): string {
  return string.replace(/\s+/, " ").trim();
}

/**
 * Get the text alternative of an element provided by native markup.
 *
 * @see https://www.w3.org/TR/html-aam-1.0/#accessible-name-and-description-computation
 */
function getNativeTextAlternative(element: Element): string | null {
  switch (element.tagName) {
    // https://www.w3.org/TR/html-aam-1.0/#img-element
    case "img":
      const alt = getAttribute(element, "alt");
      if (typeof alt === "string" && alt) {
        return flatten(alt);
      }

    // https://www.w3.org/TR/html-aam-1.0/#table-element
    case "table":
      const caption = find(element, "caption");
      if (caption) {
        return getTextAlternative(caption);
      }
  }

  return null;
}

/**
 * Check if an element is a "control embedded within the label of another
 * widget".
 */
function isEmbeddedControl(element: Element, referencing: boolean): boolean {
  return false;
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
  switch (element.tagName) {
    case "button":
    case "legend":
    case "output":
    case "summary":
    case "figcaption":
      return true;
  }

  return isTextLevelElement(element);
}

/**
 * @see https://www.w3.org/TR/html/textlevel-semantics.html
 * @see https://www.w3.org/TR/html-aam-1.0/#text-level-elements-not-listed-elsewhere
 */
function isTextLevelElement(element: Element): boolean {
  switch (element.tagName) {
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
