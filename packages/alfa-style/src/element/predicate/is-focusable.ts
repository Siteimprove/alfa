import { Element } from "@siteimprove/alfa-dom";
import { Device } from "@siteimprove/alfa-device";
import { Predicate } from "@siteimprove/alfa-predicate";

import { isRendered } from "../../node/predicate/is-rendered";

const { hasTabIndex, isActuallyDisabled } = Element;
const { and, not } = Predicate;

/**
 * {@link https://html.spec.whatwg.org/#focusable-area}
 *
 * @public
 */
export function isFocusable(device: Device): Predicate<Element> {
  return and(hasTabIndex(), and(not(isActuallyDisabled), isRendered(device)));
}
