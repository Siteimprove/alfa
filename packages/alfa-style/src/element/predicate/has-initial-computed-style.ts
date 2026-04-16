import type { Device } from "@siteimprove/alfa-device";
import type { Text } from "@siteimprove/alfa-dom";
import { Element } from "@siteimprove/alfa-dom";
import type { Predicate } from "@siteimprove/alfa-predicate";
import type { Context } from "@siteimprove/alfa-selector";

import { hasComputedStyle } from "./has-computed-style.ts";
import { Longhands } from "../../longhands.ts";

/**
 * @public
 */
export function hasInitialComputedStyle<N extends Longhands.Name>(
  name: N,
  device: Device,
  context?: Context,
): Predicate<Element | Text> {
  return hasComputedStyle(
    name,
    (value) => value.equals(Longhands.get(name).initial),
    device,
    context,
  );
}
