import { BrowserSpecific, map, reduce } from "@siteimprove/alfa-compatibility";
import {
  Element,
  getAttribute,
  getChildNodes,
  getComputedStyle,
  getElementNamespace,
  getInputType,
  getLabel,
  getRootNode,
  getTextContent,
  InputType,
  isElement,
  isText,
  Namespace,
  Node,
  querySelector,
  Text
} from "@siteimprove/alfa-dom";
import { none, option, Option, some } from "@siteimprove/alfa-util";
import { getRole } from "./get-role";
import { hasNameFrom } from "./has-name-from";
import { isVisible } from "./is-visible";
import { resolveReferences } from "./resolve-references";
import * as Roles from "./roles";

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
): Option<string> | BrowserSpecific<Option<string>>;

/**
 * @internal
 */
export function getTextAlternative(
  node: Element | Text,
  context: Node,
  visited: Set<Element | Text>,
  options?: TextAlternativeOptions
): Option<string> | BrowserSpecific<Option<string>>;

export function getTextAlternative(
  node: Element | Text,
  context: Node,
  visited: Set<Element | Text> = new Set(),
  options: TextAlternativeOptions = {}
): Option<string> | BrowserSpecific<Option<string>> {
  if (visited.has(node) && options.revisiting !== true) {
    return null;
  }

  visited.add(node);

  // https://www.w3.org/TR/accname/#step2A
  if (!isVisible(node, context) && options.referencing !== true) {
    return null;
  }

  // Perform the last step at this point in order to appease the type checker.
  // Otherwise, we might risk that we're not dealing with an element in the
  // remaining steps below.
  // https://www.w3.org/TR/accname/#step2G
  if (isText(node)) {
    const label = flatten(node.data, options);

    if (label === "") {
      return null;
    }

    return label;
  }

  return (
    BrowserSpecific.of(null, [
      "chrome",
      "edge",
      "firefox",
      "ie",
      "opera",
      "safari"
    ])
      // https://www.w3.org/TR/accname/#step2B
      .map(alt =>
        none(alt, () =>
          getAriaLabelledbyTextAlternative(node, context, visited, options)
        )
      )

      // https://www.w3.org/TR/accname/#step2C
      .map(alt =>
        none(alt, () =>
          getAriaLabelTextAlternative(node, context, visited, options)
        )
      )

      // https://www.w3.org/TR/accname/#step2D
      .map(alt =>
        none(alt, () =>
          map(getRole(node, context), role => {
            if (role !== Roles.Presentation && role !== Roles.None) {
              return getNativeTextAlternative(node, context, visited, options);
            }

            return null;
          })
        )
      )

      // https://www.w3.org/TR/accname/#step2E
      .map(alt =>
        none(alt, () => {
          if (options.labelling === true || options.referencing === true) {
            return getEmbeddedControlTextAlternative(
              node,
              context,
              visited,
              options
            );
          }

          return null;
        })
      )

      // https://www.w3.org/TR/accname/#step2F
      // https://www.w3.org/TR/accname/#step2G
      .map(alt =>
        none(alt, () =>
          map(getRole(node, context), role => {
            if (
              (role !== null && hasNameFrom(role, "contents")) ||
              options.referencing === true ||
              options.descending === true ||
              isNativeTextAlternativeElement(node)
            ) {
              return getSubtreeTextAlternative(node, context, visited, options);
            }

            return null;
          })
        )
      )

      // https://www.w3.org/TR/accname/#step2I
      .map(alt =>
        none(alt, () =>
          getTooltipTextAlternative(node, context, visited, options)
        )
      )

      .get()
  );
}

const whitespace = /\s+/g;

/**
 * Return a flattened and trimmed version of a string.
 *
 * @see https://www.w3.org/TR/accname/#terminology
 */
function flatten(string: string, options: TextAlternativeOptions): string {
  return options.recursing === true
    ? string
    : string.replace(whitespace, " ").trim();
}

/**
 * Get the text alternative of an element provided by the `aria-labelledby`
 * attribute if present.
 */
function getAriaLabelledbyTextAlternative(
  element: Element,
  context: Node,
  visited: Set<Element | Text>,
  options: TextAlternativeOptions
): Option<string> | BrowserSpecific<Option<string>> {
  const labelledBy = getAttribute(element, "aria-labelledby");

  if (
    labelledBy !== null &&
    labelledBy !== "" &&
    options.referencing !== true
  ) {
    const rootNode = getRootNode(element, context);

    const references = resolveReferences(rootNode, context, labelledBy).map(
      element =>
        getTextAlternative(element, context, visited, {
          recursing: true,
          referencing: true
        })
    );

    const label = reduce(
      references,
      (alt, text) =>
        some(text, text => option(alt, alt => `${alt} ${text}`, () => text)),
      null as Option<string>
    );

    return map(label, label => some(label, label => flatten(label, options)));
  }

  return null;
}

/**
 * Get the text alternative of an element provided by the `aria-label` attribute
 * if present.
 */
function getAriaLabelTextAlternative(
  element: Element,
  context: Node,
  visited: Set<Element | Text>,
  options: TextAlternativeOptions
): Option<string> | BrowserSpecific<Option<string>> {
  const label = getAttribute(element, "aria-label", { trim: true });

  if (label !== null && label !== "") {
    return flatten(label, options);
  }

  return null;
}

/**
 * Get the text alternative of an element provided by native markup.
 */
function getNativeTextAlternative(
  element: Element,
  context: Node,
  visited: Set<Element | Text>,
  options: TextAlternativeOptions
): Option<string> | BrowserSpecific<Option<string>> {
  const namespace = getElementNamespace(element, context);

  if (namespace !== null) {
    switch (namespace) {
      case Namespace.HTML:
        return getHtmlTextAlternative(element, context, visited, options);
      case Namespace.SVG:
        return getSvgTextAlternative(element, context, visited, options);
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
  visited: Set<Element | Text>,
  options: TextAlternativeOptions
): Option<string> | BrowserSpecific<Option<string>> {
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
      switch (type) {
        // https://www.w3.org/TR/html-aam/#input-type-button-input-type-submit-and-input-type-reset
        case InputType.Button:
        case InputType.Submit:
        case InputType.Reset: {
          const value = getAttribute(element, "value");

          if (value !== null && value !== "") {
            return value;
          }

          if (type === InputType.Submit) {
            return "Submit";
          }

          if (type === InputType.Reset) {
            return "Reset";
          }

          break;
        }

        // https://www.w3.org/TR/html-aam/#input-type-image
        case InputType.Image: {
          const alt = getAttribute(element, "alt");

          if (alt !== null && alt !== "") {
            return flatten(alt, options);
          }

          const value = getAttribute(element, "value");

          if (value !== null && value !== "") {
            return flatten(value, options);
          }
        }
      }
      break;

    // https://www.w3.org/TR/html-aam/#fieldset-and-legend-elements
    case "fieldset": {
      const legend = querySelector(element, context, "legend");

      if (legend !== null) {
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

      if (caption !== null) {
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
        return flatten(alt, options);
      }

      break;
    }

    // https://www.w3.org/TR/html-aam/#table-element
    case "table": {
      const caption = querySelector(element, context, "caption");

      if (caption !== null) {
        return flatten(
          getTextContent(caption, context, { flattened: true }),
          options
        );
      }
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
  visited: Set<Element | Text>,
  options: TextAlternativeOptions
): Option<string> | BrowserSpecific<Option<string>> {
  if (element.localName === "title") {
    return flatten(getTextContent(element, context), options);
  }

  const title = querySelector(element, context, ":scope > title");
  if (title !== null) {
    return getTextAlternative(title, context, visited, {
      recursing: true,
      descending: true
    });
  }

  switch (element.localName) {
    case "a":
      const title = getAttribute(element, "xlink:title");

      if (title !== null && title !== "") {
        return flatten(title, options);
      }
  }

  return null;
}

/**
 * Get the text alternative of an element that is deemed an embedded control.
 */
function getEmbeddedControlTextAlternative(
  element: Element,
  context: Node,
  visited: Set<Element | Text>,
  options: TextAlternativeOptions
): Option<string> | BrowserSpecific<Option<string>> {
  const role = getRole(element, context);

  switch (role) {
    case Roles.TextBox:
      switch (element.localName) {
        case "input":
          const value = getAttribute(element, "value");

          if (value !== null && value !== "") {
            return flatten(value, options);
          }

          break;

        default:
          return flatten(
            getTextContent(element, context, { flattened: true }),
            options
          );
      }
      break;

    case Roles.Button:
      const label = getTextAlternative(element, context, visited, {
        recursing: true,
        revisiting: true
      });

      return map(label, label => some(label, label => flatten(label, options)));
  }

  return null;
}

/**
 * Get the text alternative of an element provided by its subtree contents.
 */
function getSubtreeTextAlternative(
  element: Element,
  context: Node,
  visited: Set<Element | Text>,
  options: TextAlternativeOptions
): Option<string> | BrowserSpecific<Option<string>> {
  const children: Array<Option<string> | BrowserSpecific<Option<string>>> = [];

  for (const child of getChildNodes(element, context, { flattened: true })) {
    if (isElement(child) || isText(child)) {
      children.push(
        getTextAlternative(child, context, visited, {
          recursing: true,
          descending: true,
          // Pass down the labelling flag as the current call may have
          // been initiated from a labelling element; the subtree will
          // therefore also have to be considered part of the labelling
          // element.
          labelling: options.labelling
        })
      );
    }
  }

  const alt = reduce<Option<string>, Option<string>>(
    children,
    (alt, child) =>
      option(
        child,
        child => option(alt, alt => alt + child, () => child),
        () => alt
      ),
    null
  );

  const after = getComputedStyle(element, context, { pseudo: "after" });

  const before = getComputedStyle(element, context, { pseudo: "before" });

  return map(alt, alt =>
    some(alt, alt => {
      if (isArray(before.content)) {
        alt = before.content.join("") + alt;
      }

      if (isArray(after.content)) {
        alt = alt + after.content.join("");
      }

      return flatten(alt, options);
    })
  );
}

/**
 * Get the text alternative of an element provided by a native tooltip
 * attribute.
 */
function getTooltipTextAlternative(
  element: Element,
  context: Node,
  visited: Set<Element | Text>,
  options: TextAlternativeOptions
): Option<string> {
  const title = getAttribute(element, "title");

  if (title !== null && title !== "") {
    return flatten(title, options);
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
