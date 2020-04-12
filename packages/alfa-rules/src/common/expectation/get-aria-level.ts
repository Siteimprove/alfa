import { Node } from "@siteimprove/alfa-aria";
import { Branched } from "@siteimprove/alfa-branched";
import { Browser } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";

export function getAriaLevel(
  element: Element,
  device: Device
): Branched<number, Browser> {
  return Node.from(element, device).map((accNode) =>
    accNode
      .attribute("aria-level")
      .map((level) => Number(level))
      .getOr(NaN)
  );
}
