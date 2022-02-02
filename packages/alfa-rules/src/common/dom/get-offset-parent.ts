import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Option, None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

const { and, or, not, test } = Predicate;
const { hasName, isElement } = Element;

import { isPositioned } from "../predicate/is-positioned";
import { isRendered } from "../predicate/is-rendered";
import { isRoot } from "../predicate/is-root";

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
