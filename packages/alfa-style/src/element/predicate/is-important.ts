import type { Device } from "@siteimprove/alfa-device";
import type { Element } from "@siteimprove/alfa-dom";
import type { Predicate } from "@siteimprove/alfa-predicate";

import type { Longhands } from "../../longhands.ts";

import { hasComputedStyle } from "./has-computed-style.ts";

/**
 * @public
 */
export function isImportant(
  device: Device,
  property: Longhands.Name,
): Predicate<Element> {
  return hasComputedStyle(
    property,
    (_, source) => source.some((declaration) => declaration.important),
    device,
  );
}
