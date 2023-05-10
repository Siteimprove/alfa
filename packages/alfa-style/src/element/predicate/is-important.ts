import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import type { Longhands } from "../../longhands";

import { hasComputedStyle } from "./has-computed-style";

/**
 * @public
 */
export function isImportant(
  device: Device,
  property: Longhands.Name
): Predicate<Element> {
  return hasComputedStyle(
    property,
    (_, source) => source.some((declaration) => declaration.important),
    device
  );
}
