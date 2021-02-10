import { Node } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasHeadingLevel(
  device: Device,
  predicate: Predicate<number> = (n) => !isNaN(n)
): Predicate<Element> {
  return (element) =>
    Node.from(element, device).every((node) =>
      node
        .attribute("aria-level")
        .map((level) => Number(level.value))
        .some(predicate)
    );
}
