import { map } from "@siteimprove/alfa-util";
import {
  Node,
  Element,
  Text,
  Namespace,
  isText,
  isElement,
  querySelector,
  getAttribute,
  getRootNode,
  getTextContent,
  getLabel,
  getElementNamespace,
  getInputType,
  getComputedStyle
} from "@siteimprove/alfa-dom";
import * as Roles from "./roles";
import { getRole } from "./get-role";
import { isVisible } from "./is-visible";
import { resolveReferences } from "./resolve-references";
import { hasNameFrom } from "./has-name-from";

const { isArray } = Array;

/**
 * @internal
 */
export type TextAlternativeOptions = Readonly<{
  recursing?: boolean;
  referencing?: boolean;
  revisiting?: boolean;
  labelling?: boolean;
  descending?: boolean;
}>;

/**
 * Get the computed accessible text alternative of an element.
 *
 * @see https://www.w3.org/TR/accname/
 *
 * @example
 * const button = <button>Foo</button>;
 * getTextAlternative(button, <section>{button}</section>);
 * // => "Foo"
 *
 * @example
 * const img = <img alt="Foo" src="foo.png" />;
 * getTextAlternative(img, <section>{img}</section>);
 * // => "Foo"
 */
export function getTextAlternative(
  node: Element | Text,
  context: Node
): string | null;

/**
 * @internal
 */
export function getTextAlternative(
  node: Element | Text,
  context: Node,
  visited: Set<Element | Text>,
  options?: TextAlternativeOptions
): string | null;

export function getTextAlternative(
  node: Element | Text,
  context: Node,
  visited: Set<Element | Text> = new Set(),
  options: TextAlternativeOptions = {}
): string | null {
  if (visited.has(node) && !options.revisiting) {
    return null;
  }

  visited.add(node);

  // https://www.w3.org/TR/accname/#step2A
  if (!isVisible(node, context) && !options.referencing) {
    return null;
  }

  // Perform the last step at this point in order to appease the type checker.
  // Otherwise, we might risk that we're not dealing with an element in the
  // remaining steps below.
  // https://www.w3.org/TR/accname/#step2G
  if (isText(node)) {
    return flatten(node.data, options) || null;
  }

  // https://www.w3.org/TR/accname/#step2B
  const labelledBy = getAttribute(node, "aria-labelledby");
  if (
    labelledBy !== null &&
    labelledBy !== "" &&
    labelledBy !== "aria-labelledby" &&
    !options.referencing
  ) {
    const rootNode = getRootNode(node, context);

    if (rootNode !== null) {
      const references = resolveReferences(rootNode, context, labelledBy).map(
        element =>
          getTextAlternative(element, context, visited, {
            recursing: true,
            referencing: true
          })
      );

      if (references.length > 0) {
        return flatten(references.join(" "), options);
      }
    }
  }

  // https://www.w3.org/TR/accname/#step2C
  const label = getAttribute(node, "aria-label", { trim: true });
  if (label && label !== "aria-label") {
    return flatten(label, options);
  }

  const role = getRole(node, context);

  // https://www.w3.org/TR/accname/#step2D
  if (role !== Roles.Presentation && role !== Roles.None) {
    const native = getNativeTextAlternative(node, context, visited);
    if (native !== null) {
      return flatten(native, options);
    }
  }

  // https://www.w3.org/TR/accname/#step2E
  if (options.labelling || options.referencing) {
    switch (role) {
      case Roles.TextBox:
        switch (node.localName) {
          case "input":
            const value = getAttribute(node, "value");
            if (value !== null && value !== "") {
              return flatten(value, options);
            }
            break;
          default:
            return flatten(getTextContent(node), options);
        }
        break;
      case Roles.Button:
        const label = getTextAlternative(node, context, visited, {
          recursing: true,
          revisiting: true
        });

        if (label !== null) {
          return flatten(label, options);
        }
    }
  }

  // https://www.w3.org/TR/accname/#step2F
  // https://www.w3.org/TR/accname/#step2G
  if (
    (role !== null && hasNameFrom(role, "contents")) ||
    options.referencing ||
    options.descending ||
    isNativeTextAlternativeElement(node)
  ) {
    const children = map(
      node.childNodes,
      child =>
        isElement(child) || isText(child)
          ? getTextAlternative(child, context, visited, {
              recursing: true,
              descending: true,
              // Pass down the labelling flag as the current call may have been
              // initiated from a labelling element; the subtree will therefore
              // also have to be considered part of the labelling element.
              labelling: options.labelling
            })
          : null
    ).filter(child => child !== null);

    const before = getComputedStyle(node, context, { pseudo: "before" });

    if (isArray(before.content)) {
      children.unshift(before.content.join(""));
    }

    const after = getComputedStyle(node, context, { pseudo: "after" });

    if (isArray(after.content)) {
      children.push(after.content.join(""));
    }

    if (children.length > 0) {
      return flatten(children.join(""), options);
    }
  }

  // https://www.w3.org/TR/accname/#step2I
  const title = getAttribute(node, "title");
  if (title !== null && title !== "") {
    return flatten(title, options);
  }

  return null;
}

const whitespace = /\s+/g;

/**
 * Return a flattened and trimmed version of a string.
 *
 * @see https://www.w3.org/TR/accname/#terminology
 */
function flatten(string: string, options: TextAlternativeOptions): string {
  return options.recursing ? string : string.replace(whitespace, " ").trim();
}

/**
 * Get the text alternative of an element provided by native markup.
 */
function getNativeTextAlternative(
  element: Element,
  context: Node,
  visited: Set<Element | Text>
): string | null {
  const namespace = getElementNamespace(element, context);

  if (namespace !== null) {
    switch (namespace) {
      case Namespace.HTML:
        return getHtmlTextAlternative(element, context, visited);
      case Namespace.SVG:
        return getSvgTextAlternative(element, context, visited);
    }
  }

  return null;
}

/**
 * @see https://www.w3.org/TR/html-aam/#accessible-name-and-description-computation
 */
function getHtmlTextAlternative(
  element: Element,
  context: Node,
  visited: Set<Element | Text>
): string | null {
  const label = getLabel(element, context);
  if (label !== null) {
    return getTextAlternative(label, context, visited, {
      recursing: true,
      labelling: true
    });
  }

  switch (element.localName) {
    case "input":
      const type = getInputType(element);
      if (type !== null) {
        switch (type) {
          // https://www.w3.org/TR/html-aam/#input-type-button-input-type-submit-and-input-type-reset
          case "button":
          case "submit":
          case "reset": {
            const value = getAttribute(element, "value");
            if (value !== null && value !== "") {
              return value;
            }

            if (type === "submit") {
              return "Submit";
            }

            if (type === "reset") {
              return "Reset";
            }

            break;
          }

          // https://www.w3.org/TR/html-aam/#input-type-image
          case "image": {
            const alt = getAttribute(element, "alt");
            if (alt !== null && alt !== "") {
              return alt;
            }

            const value = getAttribute(element, "value");
            if (value !== null && value !== "") {
              return value;
            }
          }
        }
      }
      break;

    // https://www.w3.org/TR/html-aam/#fieldset-and-legend-elements
    case "fieldset": {
      const legend = querySelector(element, context, "legend");
      if (legend) {
        return getTextAlternative(legend, context, visited, {
          recursing: true,
          descending: true
        });
      }
      break;
    }

    // https://www.w3.org/TR/html-aam/#figure-and-figcaption-elements
    case "figure": {
      const caption = querySelector(element, context, "figcaption");
      if (caption) {
        return getTextAlternative(caption, context, visited, {
          recursing: true,
          descending: true
        });
      }
      break;
    }

    // https://www.w3.org/TR/html-aam/#img-element
    case "img": {
      const alt = getAttribute(element, "alt");
      if (alt !== null && alt !== "") {
        return alt;
      }
      break;
    }

    // https://www.w3.org/TR/html-aam/#table-element
    case "table": {
      const caption = querySelector(element, context, "caption");
      if (caption) {
        return getTextContent(caption);
      }
      break;
    }
  }

  return null;
}

/**
 * @see https://www.w3.org/TR/svg-aam/#mapping_additional_nd
 */
function getSvgTextAlternative(
  element: Element,
  context: Node,
  visited: Set<Element | Text>
): string | null {
  if (element.localName === "title") {
    return getTextContent(element);
  }

  const title = querySelector(element, context, ":scope > title");
  if (title) {
    return getTextAlternative(title, context, visited, {
      recursing: true,
      descending: true
    });
  }

  switch (element.localName) {
    case "a":
      const title = getAttribute(element, "xlink:title");
      if (title !== null && title !== "") {
        return title;
      }
  }

  return null;
}

/**
 * Check if an element is a "native host language text alternative element".
 * The elements that qualify as such are defined in the HTML Accessibility
 * API Mappings specification as elements whose text alternative can be
 * computed from their subtree as well as <label> elements.
 *
 * @see https://www.w3.org/TR/html-aam/#accessible-name-and-description-computation
 */
function isNativeTextAlternativeElement(element: Element): boolean {
  switch (element.localName) {
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
 * Check if an element is a "text level elements not listed elsewhere". A few
 * text level elements, such as anchors, are handled elsewhere and are therefore
 * not considered by this function.
 *
 * @see https://www.w3.org/TR/html-aam/#text-level-elements-not-listed-elsewhere
 */
function isTextLevelElement(element: Element): boolean {
  switch (element.localName) {
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
