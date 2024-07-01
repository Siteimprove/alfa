import type { Device } from "@siteimprove/alfa-device";
import type { Element } from "@siteimprove/alfa-dom";
import type { Predicate } from "@siteimprove/alfa-predicate";

import { Style } from "../../style.js";

/**
 * {@link https://html.spec.whatwg.org/#inert}
 *
 * @public
 */
export function isInert(device: Device): Predicate<Element> {
  return Style.hasComputedStyle(
    "visibility",
    (specified) =>
      specified.value === "hidden" || specified.value === "collapse",
    device,
  );
}
