import { Branched } from "@siteimprove/alfa-branched";
import { Browser } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Element,
  getAttribute,
  getChildNodes,
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
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { getRole } from "./get-role";
import { isVisible } from "./is-visible";
import { resolveReferences } from "./resolve-references";

const { equals, test } = Predicate;

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
export function getAccessibleName(
  node: Element | Text,
  context: Node,
  device: Device
): Branched<Option<string>, Browser>;

/**
 * @internal
 */
export function getAccessibleName(
  node: Element | Text,
  context: Node,
  device: Device,
  visited: Set<Element | Text>,
  options?: getTextAlternative.Options
): Branched<Option<string>, Browser>;

export function getAccessibleName(
  node: Element | Text,
  context: Node,
  device: Device,
  visited: Set<Element | Text> = new Set(),
  options: getTextAlternative.Options = {}
): Branched<Option<string>, Browser> {
  if (visited.has(node) && options.revisiting !== true) {
    return Branched.of(None);
  }

  visited.add(node);

  // https://www.w3.org/TR/accname/#step2A
  if (!isVisible(node, context, device) && options.referencing !== true) {
    return Branched.of(None);
  }

  // Perform the last step at this point in order to appease the type checker.
  // Otherwise, we might risk that we're not dealing with an element in the
  // remaining steps below.
  // https://www.w3.org/TR/accname/#step2G
  if (isText(node)) {
    const label = flatten(node.data, options);

    return Branched.of(label === "" ? None : Some.of(label));
  }

  return (
    // https://www.w3.org/TR/accname/#step2B
    getAriaLabelledbyTextAlternative(node, context, device, visited, options)
      // https://www.w3.org/TR/accname/#step2C
      .map(alt =>
        alt.orElse(() =>
          getAriaLabelTextAlternative(node, context, visited, options)
        )
      )
      // https://www.w3.org/TR/accname/#step2D
      .flatMap(alt => {
        if (alt.isNone()) {
          return getRole(node, context, { implicit: false }).flatMap(role => {
            if (
              role
                .filter(role => test(equals("presentation", "none"), role.name))
                .isSome()
            ) {
              return Branched.of(None);
            }

            return getNativeTextAlternative(
              node,
              context,
              device,
              visited,
              options
            );
          });
        }

        return Branched.of(alt);
      })
      // https://www.w3.org/TR/accname/#step2E
      .flatMap(alt => {
        if (alt.isNone()) {
          if (options.labelling !== true && options.referencing !== true) {
            return Branched.of(None);
          }

          return getEmbeddedControlTextAlternative(
            node,
            context,
            device,
            visited,
            options
          );
        }

        return Branched.of(alt);
      })
      // https://www.w3.org/TR/accname/#step2F
      // https://www.w3.org/TR/accname/#step2G
      .flatMap(alt => {
        if (alt.isNone()) {
          return getRole(node, context).flatMap(role => {
            if (
              role
                .filter(role => role.hasNameFrom(equals("contents")))
                .isSome() ||
              options.referencing === true ||
              options.descending === true ||
              isNativeTextAlternativeElement(node)
            ) {
              return getSubtreeTextAlternative(
                node,
                context,
                device,
                visited,
                options
              );
            }

            return Branched.of(None);
          });
        }

        return Branched.of(alt);
      })

      // https://www.w3.org/TR/accname/#step2I
      .map(alt =>
        alt.orElse(() =>
          getTooltipTextAlternative(node, context, visited, options)
        )
      )
  );
}

namespace getTextAlternative {
  export interface Options {
    recursing?: boolean;
    referencing?: boolean;
    revisiting?: boolean;
    labelling?: boolean;
    descending?: boolean;
  }
}

const whitespace = /\s+/g;

/**
 * Return a flattened and trimmed version of a string.
 *
 * @see https://www.w3.org/TR/accname/#terminology
 */
function flatten(string: string, options: getTextAlternative.Options): string {
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
  device: Device,
  visited: Set<Element | Text>,
  options: getTextAlternative.Options
): Branched<Option<string>, Browser> {
  const labelledBy = getAttribute(element, context, "aria-labelledby").getOr(
    null
  );

  if (
    labelledBy === null ||
    labelledBy === "" ||
    options.referencing === true
  ) {
    return Branched.of(None);
  }

  const rootNode = getRootNode(element, context);

  return Branched.sequence(
    Iterable.map(resolveReferences(rootNode, context, labelledBy), element =>
      getAccessibleName(element, context, device, visited, {
        recursing: true,
        referencing: true
      })
    )
  ).map(alts =>
    Iterable.reduce<Option<string>>(
      alts,
      (alt, text) =>
        alt
          .map(alt => text.reduce((alt, text) => `${alt} ${text}`, alt))
          .or(text),
      None
    ).map(alt => flatten(alt, options))
  );
}

/**
 * Get the text alternative of an element provided by the `aria-label` attribute
 * if present.
 */
function getAriaLabelTextAlternative(
  element: Element,
  context: Node,
  visited: Set<Element | Text>,
  options: getTextAlternative.Options
): Option<string> {
  return getAttribute(element, context, "aria-label")
    .filter(label => label !== "")
    .map(label => flatten(label, options));
}

/**
 * Get the text alternative of an element provided by native markup.
 */
function getNativeTextAlternative(
  element: Element,
  context: Node,
  device: Device,
  visited: Set<Element | Text>,
  options: getTextAlternative.Options
): Branched<Option<string>, Browser> {
  const namespace = getElementNamespace(element, context);

  if (namespace.isSome()) {
    switch (namespace.get()) {
      case Namespace.HTML:
        return getHtmlTextAlternative(
          element,
          context,
          device,
          visited,
          options
        );

      case Namespace.SVG:
        return getSvgTextAlternative(
          element,
          context,
          device,
          visited,
          options
        );
    }
  }

  return Branched.of(None);
}

/**
 * @see https://www.w3.org/TR/html-aam/#accessible-name-and-description-computation
 */
function getHtmlTextAlternative(
  element: Element,
  context: Node,
  device: Device,
  visited: Set<Element | Text>,
  options: getTextAlternative.Options
): Branched<Option<string>, Browser> {
  const label = getLabel(element, context);

  if (label.isSome()) {
    return getAccessibleName(label.get(), context, device, visited, {
      recursing: true,
      labelling: true,
      // https://github.com/w3c/accname/issues/48
      referencing: options.referencing
    });
  }

  switch (element.localName) {
    case "input":
      return Branched.of(
        getInputType(element, context).flatMap(type => {
          switch (type) {
            // https://www.w3.org/TR/html-aam/#input-type-button-input-type-submit-and-input-type-reset
            case InputType.Button:
            case InputType.Submit:
            case InputType.Reset:
              return getAttribute(element, context, "value")
                .andThen(value =>
                  value === "" ? None : Some.of(flatten(value, options))
                )
                .orElse(() => {
                  if (type === InputType.Submit) {
                    return Some.of("Submit");
                  }

                  if (type === InputType.Reset) {
                    return Some.of("Reset");
                  }

                  return None;
                });

            // https://www.w3.org/TR/html-aam/#input-type-image
            case InputType.Image:
            default:
              return getAttribute(element, context, "alt")
                .andThen(alt =>
                  alt === "" ? None : Some.of(flatten(alt, options))
                )
                .orElse(() => getAttribute(element, context, "value"))
                .andThen(value =>
                  value === "" ? None : Some.of(flatten(value, options))
                );
          }
        })
      );

    // https://www.w3.org/TR/html-aam/#fieldset-and-legend-elements
    case "fieldset":
      return querySelector(element, context, "legend")
        .map(legend =>
          getAccessibleName(legend, context, device, visited, {
            recursing: true,
            descending: true
          })
        )
        .getOrElse(() => Branched.of(None));

    // https://www.w3.org/TR/html-aam/#figure-and-figcaption-elements
    case "figure": {
      return querySelector(element, context, "figcaption")
        .map(caption =>
          getAccessibleName(caption, context, device, visited, {
            recursing: true,
            descending: true
          })
        )
        .getOrElse(() => Branched.of(None));
    }

    // https://www.w3.org/TR/html-aam/#img-element
    case "img":
    // https://github.com/w3c/html-aam/issues/176
    case "area":
      return Branched.of(
        getAttribute(element, context, "alt").flatMap(alt =>
          alt === "" ? None : Some.of(flatten(alt, options))
        )
      );

    // https://www.w3.org/TR/html-aam/#table-element
    case "table":
      return Branched.of(
        querySelector(element, context, "caption").map(caption =>
          flatten(
            getTextContent(caption, context, { flattened: true }),
            options
          )
        )
      );
  }

  return Branched.of(None);
}

/**
 * @see https://www.w3.org/TR/svg-aam/#mapping_additional_nd
 */
function getSvgTextAlternative(
  element: Element,
  context: Node,
  device: Device,
  visited: Set<Element | Text>,
  options: getTextAlternative.Options
): Branched<Option<string>, Browser> {
  if (element.localName === "title") {
    return Branched.of(
      Some.of(flatten(getTextContent(element, context), options))
    );
  }

  const title = querySelector(element, context, ":scope > title");

  if (title.isSome()) {
    return getAccessibleName(title.get(), context, device, visited, {
      recursing: true,
      descending: true
    });
  }

  switch (element.localName) {
    case "a":
      return Branched.of(
        getAttribute(element, context, "xlink:title").flatMap(title =>
          title === "" ? None : Some.of(flatten(title, options))
        )
      );
  }

  return Branched.of(None);
}

/**
 * Get the text alternative of an element that is deemed an embedded control.
 */
function getEmbeddedControlTextAlternative(
  element: Element,
  context: Node,
  device: Device,
  visited: Set<Element | Text>,
  options: getTextAlternative.Options
): Branched<Option<string>, Browser> {
  return getRole(element, context).flatMap(role =>
    role
      .map<Branched<Option<string>, Browser>>(role => {
        switch (role.name) {
          case "button":
            return getAccessibleName(element, context, device, visited, {
              recursing: true,
              revisiting: true
            });

          case "textbox":
            switch (element.localName) {
              case "input":
                return Branched.of(
                  getAttribute(element, context, "value").flatMap(value =>
                    value === "" ? None : Some.of(flatten(value, options))
                  )
                );

              default:
                return Branched.of(
                  Some.of(
                    flatten(
                      getTextContent(element, context, { flattened: true }),
                      options
                    )
                  )
                );
            }

          default:
            return Branched.of(None);
        }
      })
      .getOrElse(() => Branched.of(None))
  );
}

/**
 * Get the text alternative of an element provided by its subtree contents.
 */
function getSubtreeTextAlternative(
  element: Element,
  context: Node,
  device: Device,
  visited: Set<Element | Text>,
  options: getTextAlternative.Options
): Branched<Option<string>, Browser> {
  const childNodes = Iterable.filter(
    getChildNodes(element, context, { flattened: true }),
    Predicate.or(isElement, isText)
  );

  const childTextAlternatives = Branched.sequence(
    Iterable.map(childNodes, childNode =>
      getAccessibleName(childNode, context, device, visited, {
        recursing: true,
        descending: true,
        // https://github.com/w3c/accname/issues/48
        referencing: options.referencing,
        // Pass down the labelling flag as the current call may have been
        // initiated from a labelling element; the subtree will therefore also
        // have to be considered part of the labelling element.
        labelling: options.labelling
      })
    )
  );

  const textAlternative = childTextAlternatives.map(alts =>
    Iterable.reduce<Option<string>>(
      alts,
      (alt, text) =>
        alt.map(alt => text.reduce((alt, text) => alt + text, alt)).or(text),
      None
    )
  );

  // const contentAfter = getComputedStyle(element, context, device, {
  //   pseudo: "after"
  // });

  // const contentBefore = getComputedStyle(element, context, device, {
  //   pseudo: "before"
  // });

  return textAlternative.map(textAlternative =>
    textAlternative.map(textAlternative => flatten(textAlternative, options))
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
  options: getTextAlternative.Options
): Option<string> {
  return getAttribute(element, context, "title").flatMap(title =>
    title === "" ? None : Some.of(flatten(title, options))
  );
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
