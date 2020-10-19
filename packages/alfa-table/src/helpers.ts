import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Real } from "@siteimprove/alfa-math";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Ok } from "@siteimprove/alfa-result";

import { parseNonNegativeInteger } from "./microsyntaxes";

const { isElement, hasName, hasNamespace } = Element;
const { and } = Refinement;

/**
 * Parse a "span" (colspan/rowspan) attribute on table cell according to specs.
 * @see https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-rows
 *      Steps 8 and 9.
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
    .map((attribute) =>
      parseNonNegativeInteger(attribute.value).map((x) =>
        Real.clamp(x, min, max)
      )
    )
    .getOr(Ok.of(failed))
    .getOr(failed);
}

export function isHtmlElementWithName(
  name: string,
  ...rest: Array<string>
): Refinement<Node, Element> {
  return and(
    isElement,
    and(hasNamespace(Namespace.HTML), hasName(name, ...rest))
  );
}
