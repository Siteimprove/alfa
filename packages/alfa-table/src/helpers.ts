import { Element, Attribute } from "@siteimprove/alfa-dom";
import { clamp } from "@siteimprove/alfa-math";
import { Ok } from "@siteimprove/alfa-result";

import { parseNonNegativeInteger } from "./microsyntaxes";

const { parseAttribute } = Attribute;

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
    .map(parseAttribute(parseNonNegativeInteger))
    .map((r) => r.map((x) => clamp(x, min, max)))
    .getOr(Ok.of(failed))
    .getOr(failed);
}

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
