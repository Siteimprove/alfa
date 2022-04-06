import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Option, None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Style } from "@siteimprove/alfa-style";

const { hasName, isElement } = Element;
const { isRoot } = Node;
const { and, or, not, test } = Predicate;
const { isPositioned, isRendered } = Style;

const isBody = hasName("body");
const isTabular = hasName("td", "th", "table");

/**
 * {@link https://www.w3.org/TR/cssom-view-1/#dom-htmlelement-offsetparent}
 */
export function getOffsetParent(
  element: Element,
  device: Device
): Option<Element> {
  const isFixed = isPositioned(device, "fixed");

  if (
    test(
      or(
        not(isRendered(device)),
        isRoot({
          flattened: true,
        }),
        isBody,
        isFixed
      ),
      element
    )
  ) {
    return None;
  }

  const isStatic = isPositioned(device, "static");

  return element
    .ancestors({
      flattened: true,
    })
    .filter(isElement)
    .find(or(not(isStatic), isBody, and(isStatic, isTabular)));
}
