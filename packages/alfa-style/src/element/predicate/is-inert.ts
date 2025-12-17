import type { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Style } from "../../style.js";

const { or } = Predicate;

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

const isInertFromAttribute = (element: Element) => element.isInert();
