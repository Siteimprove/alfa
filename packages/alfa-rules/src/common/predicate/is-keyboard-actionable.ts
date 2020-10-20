import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";

import { isVisible } from "./is-visible";
import { isTabbable } from "./is-tabbable";

const { and } = Predicate;

export function isKeyboardActionable(device: Device): Predicate<Element> {
  return and(isTabbable(device), (element) =>
    isVisible(device, Context.focus(element))(element)
  );
}
