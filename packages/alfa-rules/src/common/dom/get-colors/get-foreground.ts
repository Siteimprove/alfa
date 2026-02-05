import { Cache } from "@siteimprove/alfa-cache";
import { Color, CSS4Color } from "@siteimprove/alfa-css";
import type { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Err, Result } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Set } from "@siteimprove/alfa-set";
import { Style } from "@siteimprove/alfa-style";

import { ColorErrors } from "./color-error.js";
import { getBackground } from "./get-background.js";

const { isElement } = Element;

/**
 * @public
 */
export type Foreground = ReadonlyArray<CSS4Color.Canonical>;

const foregroundCache = Cache.empty<
  Device,
  Cache<
    Context,
    Cache<Set<Element>, Cache<Element, Result<Foreground, ColorErrors>>>
  >
>();

/**
 * Get the foreground colors of an element by:
 * 1. get the color property
 * 2. merge it with the background colors, according to opacity.
 *
 * @public
 */
export function getForeground(
  element: Element,
  device: Device,
  context: Context = Context.empty(),
  ignoredInterposedDescendants: Set<Element> = Set.empty(),
): Result<Foreground, ColorErrors> {
  return foregroundCache
    .get(device, Cache.empty)
    .get(context, Cache.empty)
    .get(ignoredInterposedDescendants, Cache.empty)
    .get(element, () => {
      const style = Style.from(element, device, context);
      const color = style.used("color").value;
      const opacity = style.computed("opacity").value;

      // If the color is not transparent, and the element is fully opaque,
      // then we do not need to dig further
      if (color.alpha.value * opacity.value === 1) {
        return Result.of<Foreground, ColorErrors>([color]);
      }

      // If the foreground color is (partly) transparent, we need to merge it
      // with its background and subsequent layers.
      //
      // The opacity of the element is applied to all its content, including
      // the text. This means that we must first compute the foreground color
      // as if the element was opaque (just handling the alpha channel of the
      // fore- and backgrounds), and then use the opacity to blend in the
      // previous layers.

      // First, we gather the background colors, even if we did not manage to
      // get a foreground colors, in order to have a list of all ColorError on
      // the way.
      const backgroundColors = getBackground(
        element,
        device,
        context,
        1,
        ignoredInterposedDescendants,
      );

      // If we have both foreground and background color, we can merge them.
      if (backgroundColors.isOk()) {
        // The background color may itself have an alpha channel, independently
        // of the opacity of the element, and this alpha channel needs to be
        // taken into account (as well as the alpha/opacity of all previous layers).
        const colors = backgroundColors.map((background) =>
          background.map((backdrop) => Color.composite(color, backdrop, 1)),
        );

        // Finally, we need to merge again, this time using the opacity of the
        // current element.
        for (const parent of element.parent(Node.flatTree).filter(isElement)) {
          return colors.flatMap((colors) =>
            getBackground(
              parent,
              device,
              context,
              undefined,
              ignoredInterposedDescendants,
            ).map((background) =>
              colors.flatMap((color) =>
                background.map((backdrop) =>
                  Color.composite(color, backdrop, opacity.value),
                ),
              ),
            ),
          );
        }

        // If there is no parent, we just return the colors found so far.
        return colors;
      } else {
        // We are missing  background.
        return backgroundColors;
      }
    });
}
