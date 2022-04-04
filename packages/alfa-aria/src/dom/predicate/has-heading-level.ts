import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Node } from "../../node";

/**
 * @public
 */
export function hasHeadingLevel(
  device: Device,
  predicate: Predicate<number> = (n) => !isNaN(n)
): Predicate<Element> {
  return (element) =>
    Node.from(element, device)
      .attribute("aria-level")
      .map((level) => Number(level.value))
      .some(predicate);
}
