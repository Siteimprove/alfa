import {Mapper} from "@siteimprove/alfa-mapper";
import {clamp} from "@siteimprove/alfa-math";
import {Parser} from "@siteimprove/alfa-parser";
import {Predicate} from "@siteimprove/alfa-predicate";
import {Err, Ok, Result} from "@siteimprove/alfa-result";
import {Attribute, Element, Namespace, Node} from "..";

const { and, equals, property } = Predicate;

// micro syntaxes to move to alfa-parser
// https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#signed-integers

export function parseInteger(str: string): Result<readonly [string, number], string> {
  // empty/whitespace string are errors for specs, not for Number…
  // \s seems to be close enough to "ASCII whitespace".
  if (str.match(/^\s*$/)) {
    return Err.of("The string is empty");
  }
  const raw = Number(str);
  return isNaN(raw) ?
    Err.of("The string does not represent a number") :
    raw !== Math.floor(raw) ?
      Err.of("The string does not represent an integer") :
      // 0 and -0 are different (but equal…) floats. Normalising.
      Ok.of(["", raw === -0 ? 0 : raw] as const);
}

// https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#rules-for-parsing-non-negative-integers
export function parseNonNegativeInteger(str: string): Result<readonly [string, number], string> {
  const result = parseInteger(str);
  return result.andThen(([_, value]) =>
    value < 0 ?
      Err.of("This is a negative number") :
      result)
}
// end micro syntaxes

// attribute helper should move to attribute
export function parseAttribute<RESULT, ERROR>(parser: Parser<string, RESULT, ERROR>): Mapper<Attribute, Result<RESULT, ERROR>> {
  return (attribute) =>
    parser(attribute.value)
      .andThen(([_, value]) => Ok.of(value));
}
// end attribute helper

export function parseSpan(element: Element, name: string, min: number, max: number, failed: number): number {
  return element.attribute(name)
    .map(parseAttribute(parseNonNegativeInteger))
    .map(r => r.map(x => clamp(x, min, max)))
    .getOr(Ok.of(failed))
    .getOr(failed);
}

// Bad copy from rule helpers. Move to DOM helpers?
function hasNamespace(
  predicate: Predicate<Namespace> = () => true
): Predicate<Element> {
  return element => element.namespace.some(predicate);
}

export function hasName<T extends { readonly name: string }>(
  predicate: Predicate<string> = () => true
): Predicate<T> {
  return property("name", predicate);
}
// end copied from rule

export function isElementByName(...names: Array<string>): Predicate<Node, Element> {
  return and(Element.isElement,
    and(hasNamespace(equals(Namespace.HTML)),
      hasName(equals(...names))
    ));
}
