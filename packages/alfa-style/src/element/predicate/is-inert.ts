import type { Device } from "@siteimprove/alfa-device";
import { Cache } from "@siteimprove/alfa-cache";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Style } from "../../style.js";

const { hasAttribute, hasName } = Element;
const { and, or } = Predicate;

/**
 * {@link https://html.spec.whatwg.org/#inert}
 *
 * @public
 */
export const isInert = (device: Device) =>
  or(isInertFromVisibility(device), isInertFromAttribute);

const isInertFromVisibility = (device: Device) =>
  Style.hasComputedStyle(
    "visibility",
    (specified) =>
      specified.value === "hidden" || specified.value === "collapse",
    device,
  );

const isOpenDialog = and(hasName("dialog"), hasAttribute("open"));
const hasInertAttribute = hasAttribute("inert");

const cache = Cache.empty<Element, boolean>();
function isInertFromAttribute(element: Element): boolean {
  return cache.get(element, () => {
    if (hasInertAttribute(element)) {
      return true;
    }
    if (isOpenDialog(element)) {
      return false;
    }
    const parent = element.ancestors(Node.flatTree).find(Element.isElement);
    if (!parent.isSome()) {
      return false;
    }
    return isInertFromAttribute(parent.get());
  });
}
