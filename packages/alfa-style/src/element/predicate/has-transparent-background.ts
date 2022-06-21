import { Cache } from "@siteimprove/alfa-cache";
import { Color, Keyword } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Context } from "@siteimprove/alfa-selector";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Style } from "../../style";

const { isReplaced, isElement } = Element;

const { or, test } = Predicate;

const cache = Cache.empty<Device, Cache<Context, Cache<Element, boolean>>>();

/**
 * Checks if an element has transparent background.
 * The element may be not fully transparent (e.g., have text) while still having transparent background.
 * @public
 */

export function hasTransparentBackground(
  device: Device,
  context: Context = Context.empty()
): Predicate<Element> {
  return (element) =>
    cache
      .get(device, Cache.empty)
      .get(context, Cache.empty)
      .get(element, () => {
        if (
          test(
            or(
              // Replaced elements are assumed to be replaced by non-transparent content.
              isReplaced,
              // Elements with non-transparent background are not transparent.
              Style.hasComputedStyle(
                "background-color",
                (color) => !Color.isTransparent(color),
                device,
                context
              ),
              // Elements with a background image are not transparent.
              Style.hasComputedStyle(
                "background-image",
                (image) =>
                  !(
                    Keyword.isKeyword(image.values[0]) &&
                    image.values[0].equals(Keyword.of("none"))
                  ),
                device,
                context
              )
            ),
            element
          )
        ) {
          return false;
        }
        // The element itself has transparent background, but it may have non-transparent content.
        return element
          .children(Node.fullTree)
          .filter(isElement)
          .every(hasTransparentBackground(device, context));
      });
}
