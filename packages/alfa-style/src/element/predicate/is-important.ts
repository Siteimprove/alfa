import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Property } from "../../property";

import { hasComputedStyle } from "./has-computed-style";

/**
 * @public
 */
export function isImportant(
  device: Device,
  property: Property.Name
): Predicate<Element> {
  return hasComputedStyle(
    property,
    (_, source) => source.some((declaration) => declaration.important),
    device
  );
}