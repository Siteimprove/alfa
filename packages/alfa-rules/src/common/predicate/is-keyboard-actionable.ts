import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

import { isVisible } from "./is-visible";

const { and } = Predicate;
const { isTabbable } = Style;

/**
 * Check if an element is part of the sequential focus navigation order and is
 * visible when focused such that it can be activated by a keyboard both with
 * and without relying on visual perception.
 *
 * @remarks
 * This predicate assumes that elements that are part of the sequential focus
 * navigation order can also be activated by keyboard.
 */
export function isKeyboardActionable(device: Device): Predicate<Element> {
  return and(isTabbable(device), (element) =>
    isVisible(device, Context.focus(element))(element)
  );
}
