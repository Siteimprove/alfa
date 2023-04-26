import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import type { Longhands } from "../../longhands";

import { hasCascadedStyle } from "./has-cascaded-style";

/**
 * @deprecated
 * Used by R91/R92/R93 version 1
 *
 * @public
 */
export function hasCascadedValueDeclaredInInlineStyleOf(
  context: Element,
  device: Device,
  name: Longhands.Name
): Predicate<Element> {
  return hasCascadedStyle(
    name,
    (_, source) =>
      source.some((cascaded) =>
        context.style.some((block) =>
          block
            // We need reference equality here, not .equals as we want to check
            // if the cascaded value is exactly the declared one, not just a
            // similar one.
            .declaration((declared) => cascaded === declared)
            .isSome()
        )
      ),
    device
  );
}
