import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Property } from "../../property";

import { hasCascadedStyle } from "./has-cascaded-style";

/**
 * @public
 */
export function hasCascadedValueDeclaredInInlineStyleOf(
  context: Element,
  device: Device,
  name: Property.Name
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
