import { Equatable } from "@siteimprove/alfa-equatable";
import { clamp } from "@siteimprove/alfa-math";
import { parseNonNegativeInteger } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok } from "@siteimprove/alfa-result";

import { Element, Namespace, Node, Attribute } from "..";

const { parseAttribute } = Attribute;
const { and, equals, property } = Predicate;

/**
 * Parse a "span" (colspan/rowspan) attribute on table cell according to specs.
 * @see https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-rows
 * Steps 8 and 9.
 */
export function parseSpan(
  element: Element,
  name: string,
  min: number,
  max: number,
  failed: number
): number {
  return element
    .attribute(name)
    .map(parseAttribute(parseNonNegativeInteger))
    .map((r) => r.map((x) => clamp(x, min, max)))
    .getOr(Ok.of(failed))
    .getOr(failed);
}

// Bad copy from rule helpers. Move to DOM helpers?
function hasNamespace(
  predicate: Predicate<Namespace> = () => true
): Predicate<Element> {
  return (element) => element.namespace.some(predicate);
}

export function hasName<T extends { readonly name: string }>(
  predicate: Predicate<string> = () => true
): Predicate<T> {
  return property("name", predicate);
}
// end copied from rule

export function isElementByName(
  ...names: Array<string>
): Predicate<Node, Element> {
  return and(
    Element.isElement,
    and(hasNamespace(equals(Namespace.HTML)), hasName(equals(...names)))
  );
}

export function isEqual<T extends Equatable>(value1: T): Predicate<unknown, T> {
  return (value2) => value1.equals(value2);
}

export function isDescendantOf(
  node: Node,
  options?: Node.Traversal
): Predicate<Node> {
  return (desc) => node.descendants(options).find(isEqual(desc)).isSome();
}

// Bad copied form alfa-aria accessible name computation (aria-labelledby). Move to DOM helpers?
export function resolveReferences(
  node: Node,
  references: Iterable<string>
): Array<Element> {
  const elements: Array<Element> = [];

  for (const id of references) {
    const element = node
      .descendants()
      .find(and(Element.isElement, (element) => element.id.includes(id)));

    if (element.isSome()) {
      elements.push(element.get());
    }
  }

  return elements;
}
// End copied from accessible name computation.

/**
 * @see https://html.spec.whatwg.org/multipage/tables.html#empty-cell
 */
export function isEmpty(element: Element): boolean {
  return (
    element.children().isEmpty() &&
    // \s seems to be close enough to "ASCII whitespace".
    !!element.textContent().match(/^\s*$/)
  );
}
