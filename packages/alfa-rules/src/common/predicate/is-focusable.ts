import { Element } from "@siteimprove/alfa-dom";
import { Device } from "@siteimprove/alfa-device";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasTabIndex } from "./has-tab-index";
import { isRendered } from "./is-rendered";

const { and, not } = Predicate;

/**
 * @see https://html.spec.whatwg.org/#focusable-area
 */
export function isFocusable(device: Device): Predicate<Element> {
  return and(hasTabIndex(), and(not(Element.isDisabled), isRendered(device)));
}
