import { Element } from "@siteimprove/alfa-dom";
import { Property } from "@siteimprove/alfa-style";
import { Device } from "@siteimprove/alfa-device";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasCascadedStyle } from "./has-cascaded-style";

/**
 * Checks if the cascaded value of a property of an element is declared on that element
 */
export function hasCascadedValueDeclaredInInlineStyle(
  device: Device,
  name: Property.Name
): Predicate<Element> {
  return (element) =>
    hasCascadedStyle(
      name,
      (_, source) =>
        source.some((cascaded) =>
          element.style.some((block) =>
            block
              // We need reference equality here, not .equals as we want to check if the cascaded
              // value is exactly the declared one, not just a similar one.
              .declaration((declared) => cascaded === declared)
              .isSome()
          )
        ),
      device
    )(element);
}
