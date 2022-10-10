import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Err, Result } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

import { Color } from "./color";
import { ColorError, ColorErrors } from "./color-error";
import { getBackground } from "./get-background";

const { isElement } = Element;

export type Foreground = ReadonlyArray<Color.Resolved>;

const foregroundCache = Cache.empty<
  Device,
  Cache<Context, Cache<Element, Result<Foreground, ColorErrors>>>
>();

/**
 * Get the foreground colors of an element by:
 * 1. get the color property
 * 2. merge it with the background colors, according to opacity.
 *
 * @internal
 */
export function getForeground(
  element: Element,
  device: Device,
  context: Context = Context.empty()
): Result<Foreground, ColorErrors> {
  return foregroundCache
    .get(device, Cache.empty)
    .get(context, Cache.empty)
    .get(element, () => {
      let error: Option<ColorError<"foreground">> = None;

      const style = Style.from(element, device, context);

      let foregroundColor = style.computed("color").value;
      let parent = element.parent().filter(isElement);

      const isCurrentColor = (color: Style.Computed<"color">) =>
        color.type === "keyword" && color.value === "currentcolor";

      while (parent.isSome() && isCurrentColor(foregroundColor)) {
        foregroundColor = Style.from(parent.get(), device, context).computed(
          "color"
        ).value;
        parent = parent.get().parent().filter(isElement);
      }

      const color = Color.resolve(foregroundColor, style);

      if (color.isNone()) {
        error = Option.of(
          ColorError.unresolvableForegroundColor(element, foregroundColor)
        );
      }

      const opacity = style.computed("opacity").value;

      // If the color is not transparent, and the element is fully opaque,
      // then we do not need to dig further
      if (color.isSome() && color.get().alpha.value * opacity.value === 1) {
        return Result.of<Foreground, ColorErrors>([color.get()]);
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
      const backgroundColors = getBackground(element, device, context, 1);

      // If we have both foreground and background color, we can merge them.
      if (color.isSome() && backgroundColors.isOk()) {
        // The background color may itself have an alpha channel, independently
        // of the opacity of the element, and this alpha channel needs to be
        // taken into account (as well as the alpha/opacity of all previous layers).
        const colors = backgroundColors.map((background) =>
          background.map((backdrop) =>
            Color.composite(color.get(), backdrop, 1)
          )
        );

        // Finally, we need to merge again, this time using the opacity of the
        // current element.
        for (const parent of element.parent(Node.flatTree).filter(isElement)) {
          return colors.flatMap((colors) =>
            getBackground(parent, device, context).map((background) =>
              colors.flatMap((color) =>
                background.map((backdrop) =>
                  Color.composite(color, backdrop, opacity.value)
                )
              )
            )
          );
        }

        // If there is no parent, we just return the colors found so far.
        return colors;
      } else {
        // We are missing either foreground or background.
        return Err.of(ColorErrors.prepend(backgroundColors, error));
      }
    });
}
