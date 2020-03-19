import { Branched } from "@siteimprove/alfa-branched";
import { Browser } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace, Node, Text } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Style } from "@siteimprove/alfa-style";

import { Role } from "./role";

const { isElement } = Element;
const { isText } = Text;
const { isEmpty } = Iterable;
const { and, or, equals, test } = Predicate;

/**
 * Get the computed accessible text alternative of an element.
 *
 * @internal
 * @see https://w3c.github.io/accname/
 */
export function getName(
  node: Element | Text,
  device: Device,
  visited: Set<Element | Text> = new Set(),
  options: getName.Options = {}
): Branched<Option<string>, Browser> {
  if (visited.has(node) && options.revisiting !== true) {
    return Branched.of(None);
  }

  visited.add(node);

  // https://w3c.github.io/accname/#step2A
  if (!isRendered(node, device) && options.referencing !== true) {
    return Branched.of(None);
  }

  // Perform the last step at this point in order to appease the type checker.
  // Otherwise, we might risk that we're not dealing with an element in the
  // remaining steps below.
  // https://w3c.github.io/accname/#step2G
  if (isText(node)) {
    const label = flatten(node.data, options);

    return Branched.of(label === "" ? None : Some.of(label));
  }

  return (
    // https://w3c.github.io/accname/#step2B
    getAriaLabelledbyTextAlternative(node, device, visited, options)
      // https://w3c.github.io/accname/#step2C
      .map(alt =>
        alt.orElse(() => getAriaLabelTextAlternative(node, visited, options))
      )
      // https://w3c.github.io/accname/#step2D
      .flatMap(alt => {
        if (alt.isNone()) {
          return Role.from(node, { implicit: false }).flatMap(role => {
            if (
              role.some(role => test(equals("presentation", "none"), role.name))
            ) {
              return Branched.of(None);
            }

            return getNativeTextAlternative(node, device, visited, options);
          });
        }

        return Branched.of(alt);
      })
      // https://w3c.github.io/accname/#step2E
      .flatMap(alt => {
        if (alt.isNone()) {
          if (options.labelling !== true && options.referencing !== true) {
            return Branched.of(None);
          }

          return getEmbeddedControlTextAlternative(
            node,
            device,
            visited,
            options
          );
        }

        return Branched.of(alt);
      })
      // https://w3c.github.io/accname/#step2F
      // https://w3c.github.io/accname/#step2G
      .flatMap(alt => {
        if (alt.isNone()) {
          return Role.from(node).flatMap(role => {
            if (
              role
                .filter(role => role.hasNameFrom(equals("contents")))
                .isSome() ||
              options.referencing === true ||
              options.descending === true ||
              isNativeTextAlternativeElement(node)
            ) {
              return getSubtreeTextAlternative(node, device, visited, options);
            }

            return Branched.of(None);
          });
        }

        return Branched.of(alt);
      })

      // https://w3c.github.io/accname/#step2I
      .map(alt =>
        alt.orElse(() => getTooltipTextAlternative(node, visited, options))
      )
  );
}

/**
 * @internal
 */
namespace getName {
  export interface Options {
    recursing?: boolean;
    referencing?: boolean;
    revisiting?: boolean;
    labelling?: boolean;
    descending?: boolean;
  }
}

/**
 * Return a flattened and trimmed version of a string.
 *
 * @see https://w3c.github.io/accname/#terminology
 */
function flatten(string: string, options: getName.Options): string {
  return options.recursing === true
    ? string
    : string.replace(/\s+/g, " ").trim();
}

/**
 * Get the text alternative of an element provided by the `aria-labelledby`
 * attribute if present.
 */
function getAriaLabelledbyTextAlternative(
  element: Element,
  device: Device,
  visited: Set<Element | Text>,
  options: getName.Options
): Branched<Option<string>, Browser> {
  const labelledBy = element
    .attribute("aria-labelledby")
    .map(attr => attr.value);

  if (labelledBy.every(isEmpty) || options.referencing === true) {
    return Branched.of(None);
  }

  const references = resolveReferences(element.root(), labelledBy.get());

  if (references.length === 0) {
    return Branched.of(None);
  }

  return Branched.sequence(
    Iterable.map(references, element =>
      getName(element, device, visited, {
        recursing: true,
        referencing: true
      })
    )
  ).map(alts =>
    Option.of(
      flatten(
        Iterable.reduce(
          alts,
          (alt, text) => text.reduce((alt, text) => `${alt} ${text}`, alt),
          ""
        ),
        options
      )
    )
  );
}

/**
 * Get the text alternative of an element provided by the `aria-label` attribute
 * if present.
 */
function getAriaLabelTextAlternative(
  element: Element,
  visited: Set<Element | Text>,
  options: getName.Options
): Option<string> {
  return element
    .attribute("aria-label")
    .map(attr => attr.value)
    .filter(label => label.trim() !== "")
    .map(label => flatten(label, options));
}

/**
 * Get the text alternative of an element provided by native markup.
 */
function getNativeTextAlternative(
  element: Element,
  device: Device,
  visited: Set<Element | Text>,
  options: getName.Options
): Branched<Option<string>, Browser> {
  if (element.namespace.isSome()) {
    switch (element.namespace.get()) {
      case Namespace.HTML:
        return getHtmlTextAlternative(element, device, visited, options);

      case Namespace.SVG:
        return getSvgTextAlternative(element, device, visited, options);
    }
  }

  return Branched.of(None);
}

/**
 * @see https://w3c.github.io/html-aam/#accessible-name-and-description-computation
 */
function getHtmlTextAlternative(
  element: Element,
  device: Device,
  visited: Set<Element | Text>,
  options: getName.Options
): Branched<Option<string>, Browser> {
  const label = getLabel(element);

  if (label.isSome()) {
    return getName(label.get(), device, visited, {
      recursing: true,
      labelling: true,
      // https://github.com/w3c/accname/issues/48
      referencing: options.referencing
    });
  }

  switch (element.name) {
    case "input":
      return Branched.of(
        element
          .attribute("type")
          .map(type => type.value.toLowerCase())
          .flatMap(type => {
            switch (type) {
              // https://w3c.github.io/html-aam/#input-type-button-input-type-submit-and-input-type-reset
              case "button":
              case "submit":
              case "reset":
                return element
                  .attribute("value")
                  .andThen(value =>
                    value.value === ""
                      ? None
                      : Some.of(flatten(value.value, options))
                  )
                  .orElse(() => {
                    if (type === "submit") {
                      return Some.of("Submit");
                    }

                    if (type === "reset") {
                      return Some.of("Reset");
                    }

                    return None;
                  });

              // https://w3c.github.io/html-aam/#input-type-image
              case "image":
              default:
                return element
                  .attribute("alt")
                  .andThen(alt =>
                    alt.value === ""
                      ? None
                      : Some.of(flatten(alt.value, options))
                  )
                  .orElse(() =>
                    element.attribute("value").map(attr => attr.value)
                  )
                  .andThen(value =>
                    value === "" ? None : Some.of(flatten(value, options))
                  );
            }
          })
      );

    // https://w3c.github.io/html-aam/#fieldset-and-legend-elements
    case "fieldset":
      return element
        .children()
        .find(and(isElement, element => element.name === "legend"))
        .map(legend =>
          getName(legend, device, visited, {
            recursing: true,
            descending: true
          })
        )
        .getOrElse(() => Branched.of(None));

    // https://w3c.github.io/html-aam/#figure-and-figcaption-elements
    case "figure": {
      return element
        .children()
        .find(and(isElement, element => element.name === "figcaption"))
        .map(caption =>
          getName(caption, device, visited, {
            recursing: true,
            descending: true
          })
        )
        .getOrElse(() => Branched.of(None));
    }

    // https://w3c.github.io/html-aam/#img-element
    case "img":
    // https://github.com/w3c/html-aam/issues/176
    case "area":
      return Branched.of(
        element
          .attribute("alt")
          .flatMap(alt =>
            alt.value === "" ? None : Some.of(flatten(alt.value, options))
          )
      );

    // https://w3c.github.io/html-aam/#table-element
    case "table":
      return Branched.of(
        element
          .children()
          .find(and(isElement, element => element.name === "caption"))
          .map(caption =>
            flatten(caption.textContent({ flattened: true }), options)
          )
      );
  }

  return Branched.of(None);
}

/**
 * @see https://w3c.github.io/svg-aam/#mapping_additional_nd
 */
function getSvgTextAlternative(
  element: Element,
  device: Device,
  visited: Set<Element | Text>,
  options: getName.Options
): Branched<Option<string>, Browser> {
  if (element.name === "title") {
    return Branched.of(Option.of(flatten(element.textContent(), options)));
  }

  const title = element
    .children()
    .find(and(isElement, child => child.name === "title"));

  if (title.isSome()) {
    return getName(title.get(), device, visited, {
      recursing: true,
      descending: true
    });
  }

  switch (element.name) {
    case "a":
      return Branched.of(
        element
          .attribute(
            attr => attr.name === "title" && attr.prefix.includes("xlink")
          )
          .flatMap(title =>
            title.value === "" ? None : Some.of(flatten(title.value, options))
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
  device: Device,
  visited: Set<Element | Text>,
  options: getName.Options
): Branched<Option<string>, Browser> {
  return Role.from(element).flatMap(role =>
    role
      .map<Branched<Option<string>, Browser>>(role => {
        switch (role.name) {
          case "button":
            return getName(element, device, visited, {
              recursing: true,
              revisiting: true
            });

          case "textbox":
            switch (element.name) {
              case "input":
                return Branched.of(
                  element
                    .attribute("value")
                    .flatMap(value =>
                      value.value === ""
                        ? None
                        : Some.of(flatten(value.value, options))
                    )
                );

              default:
                return Branched.of(
                  Option.of(
                    flatten(element.textContent({ flattened: true }), options)
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
  device: Device,
  visited: Set<Element | Text>,
  options: getName.Options
): Branched<Option<string>, Browser> {
  const childNodes = element
    .children({ flattened: true })
    .filter(or(isElement, isText));

  const childTextAlternatives = Branched.sequence(
    childNodes.map(childNode =>
      getName(childNode, device, visited, {
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
  visited: Set<Element | Text>,
  options: getName.Options
): Option<string> {
  return element
    .attribute("title")
    .flatMap(title =>
      title.value === "" ? None : Some.of(flatten(title.value, options))
    );
}

/**
 * @see https://html.spec.whatwg.org/#category-label
 */
function isLabelable(element: Element): boolean {
  switch (element.name) {
    case "button":
    case "meter":
    case "output":
    case "progress":
    case "select":
    case "textarea":
      return true;

    case "input":
      return element
        .attribute("type")
        .every(attr => attr.value.toLowerCase() !== "hidden");
  }

  return false;
}

/**
 * @see https://html.spec.whatwg.org/#labeled-control
 */
function getLabel(element: Element): Option<Element> {
  if (!isLabelable(element)) {
    return None;
  }

  return element.id
    .andThen(id => {
      if (id !== "") {
        const root = element.root();

        if (root !== element) {
          const label = root
            .descendants()
            .find(
              and(
                Element.isElement,
                element =>
                  element.name === "label" &&
                  element.attribute("for").some(attr => attr.value === id)
              )
            );

          return label.filter(() => {
            const target = root
              .descendants()
              .find(and(Element.isElement, element => element.id.includes(id)));

            return target.includes(element);
          });
        }
      }

      return None;
    })
    .orElse(() =>
      element.closest(
        and(Element.isElement, element => element.name === "label")
      )
    );
}

/**
 * @see https://w3c.github.io/accname/#dfn-hidden
 */
function isRendered(node: Node, device: Device): boolean {
  if (Element.isElement(node)) {
    const display = Style.from(node, device).computed("display").value;

    const [outside] = display;

    if (outside.value === "none") {
      return false;
    }
  }

  return node
    .parent({ flattened: true })
    .every(parent => isRendered(parent, device));
}

/**
 * Check if an element is a "native host language text alternative element".
 * The elements that qualify as such are defined in the HTML Accessibility
 * API Mappings specification as elements whose text alternative can be
 * computed from their subtree as well as <label> elements.
 *
 * @see https://w3c.github.io/html-aam/#accessible-name-and-description-computation
 */
function isNativeTextAlternativeElement(element: Element): boolean {
  switch (element.name) {
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
 * @see https://w3c.github.io/html-aam/#text-level-elements-not-listed-elsewhere
 */
function isTextLevelElement(element: Element): boolean {
  switch (element.name) {
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

function resolveReferences(node: Node, references: string): Array<Element> {
  const elements: Array<Element> = [];

  for (const id of references.trim().split(/\s+/)) {
    const element = node
      .descendants()
      .find(and(isElement, element => element.id.includes(id)));

    if (element.isSome()) {
      elements.push(element.get());
    }
  }

  return elements;
}
