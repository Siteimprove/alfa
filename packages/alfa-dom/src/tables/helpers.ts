import {Equatable} from "@siteimprove/alfa-equatable";
import { Map } from "@siteimprove/alfa-map";
import { Mapper } from "@siteimprove/alfa-mapper";
import { clamp } from "@siteimprove/alfa-math";
import {Option, Some} from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

import { Attribute, Element, Namespace, Node } from "..";

const { and, equals, not, property } = Predicate;

// micro syntaxes to move to alfa-parser

/**
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#signed-integers
 */
export function parseInteger(
  str: string
): Result<readonly [string, number], string> {
  // empty/whitespace string are errors for specs, not for Number…
  // \s seems to be close enough to "ASCII whitespace".
  if (str.match(/^\s*$/)) {
    return Err.of("The string is empty");
  }
  const raw = Number(str);
  return isNaN(raw)
    ? Err.of("The string does not represent a number")
    : raw !== Math.floor(raw)
    ? Err.of("The string does not represent an integer")
    : // 0 and -0 are different (but equal…) floats. Normalising.
      Ok.of(["", raw === -0 ? 0 : raw] as const);
}

/**
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#rules-for-parsing-non-negative-integers
 */
export function parseNonNegativeInteger(
  str: string
): Result<readonly [string, number], string> {
  const result = parseInteger(str);
  return result.andThen(([_, value]) =>
    value < 0 ? Err.of("This is a negative number") : result
  );
}

/**
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#enumerated-attribute
 */
export type enumError = "missing" | "invalid"

export function parseEnumeratedValue<RESULT>(
  mapping: Map<string, RESULT>
): Parser<string, RESULT, enumError> {
  function parser(str: string): Result<readonly [string, RESULT], enumError> {
    const result = mapping.get(str.toLowerCase());

    return str === ""
      ? Err.of("missing")
      : result.isNone()
      ? Err.of("invalid")
      : Ok.of(["", result.get()] as const);
  }

  return parser;
}

/**
 * @see https://infra.spec.whatwg.org/#split-on-ascii-whitespace
 */
export function parseTokensList(str: string): Ok<readonly [string, Array<string>]> {
  return Ok.of(["", str.trim().split(/\s+/).filter(s => s !== "")] as const)
};
// end micro syntaxes

// attribute helper should move to attribute
export function parseAttribute<RESULT, ERROR>(
  parser: Parser<string, RESULT, ERROR>
): Mapper<Attribute, Result<RESULT, ERROR>> {
  return (attribute) =>
    parser(attribute.value).andThen(([_, value]) => Ok.of(value));
}
// end attribute helper

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

export function parseEnumeratedAttribute<RESULT>(
  name: string,
  mapping: Map<string, RESULT>
): (element: Element) => Option<RESULT> {
  function parser(element: Element): Option<RESULT> {
    return element
      .attribute(name)
      .map(attribute => attribute.value)
      .map(parseEnumeratedValue(mapping))
      .getOr<Result<readonly [string, RESULT], enumError>>(Err.of("missing"))
      .mapOrElse(([_, result]) => Some.of(result), err => mapping.get(err));
  }

  return parser;
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
  return value2 => value1.equals(value2);
}

export function isDescendantOf(node: Node, options?: Node.Traversal): Predicate<Node> {
  return desc => node.descendants(options).find(isEqual(desc)).isSome()
}

// Bad copied form alfa-aria accessible name computation (aria-labelledby). Move to DOM helpers?
export function resolveReferences(node: Node, references: Iterable<string>): Array<Element> {
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
