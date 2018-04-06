import {
  Element,
  Text,
  isText,
  isElement,
  find,
  getTag,
  getAttribute,
  getRoot,
  getText,
  getLabel
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
  if (
    labelledBy !== null &&
    labelledBy !== "" &&
    labelledBy !== "aria-labelledby" &&
    !referencing
  ) {
    const root = getRoot(node);

    if (root !== null) {
      const references = resolveReferences(root, labelledBy).map(element =>
        getTextAlternative(element, visited, true, true)
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
    const native = getNativeTextAlternative(node, visited);
    if (native !== null) {
      return flatten(native);
    }
  }

  // https://www.w3.org/TR/accname-aam-1.1/#step2E
  if (isEmbeddedControl(node, referencing)) {
    switch (role) {
      case Roles.TextBox:
        switch (getTag(node)) {
          case "input":
          case "textarea":
            const value = getAttribute(node, "value");
            if (value !== null && value !== "") {
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
    (role !== null && role.label && includes(role.label.from, "contents")) ||
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
  if (title !== null && title !== "") {
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
function getNativeTextAlternative(
  element: Element,
  visited: Set<Element | Text>
): string | null {
  const label = getLabel(element);
  if (label !== null) {
    return getTextAlternative(label, visited, true);
  }

  switch (getTag(element)) {
    case "input":
      const type = getAttribute(element, "type");
      if (type !== null) {
        switch (type) {
          // https://www.w3.org/TR/html-aam-1.0/#input-type-button-input-type-submit-and-input-type-reset
          case "button":
          case "submit":
          case "reset": {
            const value = getAttribute(element, "value");
            if (value !== null && value !== "") {
              return flatten(value);
            }

            if (type === "submit") {
              return "Submit";
            }

            if (type === "reset") {
              return "Reset";
            }
          }

          // https://www.w3.org/TR/html-aam-1.0/#input-type-image
          case "image": {
            const alt = getAttribute(element, "alt");
            if (alt !== null && alt !== "") {
              return flatten(alt);
            }

            const value = getAttribute(element, "value");
            if (value !== null && value !== "") {
              return flatten(value);
            }
          }
        }
      }
      break;

    // https://www.w3.org/TR/html-aam-1.0/#fieldset-and-legend-elements
    case "fieldset": {
      const legend = find(element, "legend");
      if (legend) {
        return getTextAlternative(legend, visited, true);
      }
      break;
    }

    // https://www.w3.org/TR/html-aam-1.0/#figure-and-figcaption-elements
    case "figure": {
      const caption = find(element, "figcaption");
      if (caption) {
        return getTextAlternative(caption, visited, true);
      }
      break;
    }

    // https://www.w3.org/TR/html-aam-1.0/#img-element
    case "img": {
      const alt = getAttribute(element, "alt");
      if (alt !== null && alt !== "") {
        return flatten(alt);
      }
      break;
    }

    // https://www.w3.org/TR/html-aam-1.0/#table-element
    case "table": {
      const caption = find(element, "caption");
      if (caption) {
        return getText(caption);
      }
      break;
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
 * computed from their subtree as well as <label> elements.
 *
 * @see https://www.w3.org/TR/html-aam-1.0/#accessible-name-and-description-computation
 */
function isNativeTextAlternativeElement(element: Element): boolean {
  switch (getTag(element)) {
    case "label":
    case "a":
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
 * @see https://www.w3.org/TR/html-aam-1.0/#text-level-elements-not-listed-elsewhere
 */
function isTextLevelElement(element: Element): boolean {
  switch (getTag(element)) {
    case "abbr":
    case "b":
    case "bdi":
    case "bdo":
    case "br":
    case "cite":
    case "code":
    case "dfn":
    case "em":
    case "i":
    case "kbd":
    case "mark":
    case "q":
    case "rp":
    case "rt":
    case "ruby":
    case "s":
    case "samp":
    case "small":
    case "strong":
    case "sub":
    case "sup":
    case "time":
    case "u":
    case "var":
    case "wbr":
      return true;
  }

  return false;
}
