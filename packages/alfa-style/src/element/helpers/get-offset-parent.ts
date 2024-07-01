import type { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import type { Option} from "@siteimprove/alfa-option";
import { None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import { isPositioned } from "../predicate/is-positioned.js";
import { isRendered } from "../../node/predicate/is-rendered.js";

const { hasName, isElement } = Element;
const { isRoot } = Node;
const { and, or, not, test } = Predicate;

const isBody = hasName("body");
const isTabular = hasName("td", "th", "table");

/**
 * {@link https://www.w3.org/TR/cssom-view-1/#dom-htmlelement-offsetparent}
 *
 * @public
 */
export function getOffsetParent(
  element: Element,
  device: Device,
): Option<Element> {
  const isFixed = isPositioned(device, "fixed");

  if (
    test(
      or(not(isRendered(device)), isRoot(Node.flatTree), isBody, isFixed),
      element,
    )
  ) {
    return None;
  }

  const isStatic = isPositioned(device, "static");

  return element
    .ancestors(Node.flatTree)
    .filter(isElement)
    .find(or(not(isStatic), isBody, and(isStatic, isTabular)));
}
