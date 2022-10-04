import { Array } from "@siteimprove/alfa-array";
import { Cache } from "@siteimprove/alfa-cache";
import { Percentage, RGB } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Option, None } from "@siteimprove/alfa-option";
import { Result, Err } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

import { Color } from "./color";
import { ColorError, ColorErrors } from "./color-error";
import { getLayers } from "./get-layers";

const { isVisibleShadow } = Style;

export type Background = Array<Color.Resolved>;

const backgroundCacheWithFakeOpacity = Cache.empty<
  Device,
  Cache<
    Context,
    Cache<Element, Result<Background, ColorErrors<"background" | "layer">>>
  >
>();

const backgroundCacheWithDefaultOpacity = Cache.empty<
  Device,
  Cache<
    Context,
    Cache<Element, Result<Background, ColorErrors<"background" | "layer">>>
  >
>();

export function getBackground(
  element: Element,
  device: Device,
  context: Context = Context.empty(),
  opacity?: number
): Result<Background, ColorErrors<"background" | "layer">> {
  const textShadow = Style.from(element, device, context).computed(
    "text-shadow"
  ).value;
  const cache =
    opacity === undefined
      ? backgroundCacheWithDefaultOpacity
      : backgroundCacheWithFakeOpacity;
  return cache
    .get(device, Cache.empty)
    .get(context, Cache.empty)
    .get(element, () => {
      let error: Option<ColorError<"background">> = None;

      // If the element has a visible text-shadow, we don't try to guess how it looks.
      if (textShadow.type !== "keyword" && isVisibleShadow(textShadow)) {
        error = Option.of(ColorError.textShadow(element, textShadow));
      }

      // We want to gather layers errors even if we've already found one.
      const layersColors = getLayers(element, device, context, opacity);

      return error.isNone() && layersColors.isOk()
        ? layersColors.map((layers) =>
            layers.reduce(
              (backdrops, layer) =>
                layer.colors.reduce(
                  (layers, color) =>
                    layers.concat(
                      backdrops.map((backdrop) =>
                        Color.composite(color, backdrop, layer.opacity)
                      )
                    ),
                  [] as Array<Color.Resolved>
                ),
              // We make the initial backdrop solid white as this can be assumed
              // to be the color of the canvas onto which the other backgrounds
              // are rendered.
              [
                RGB.of(
                  Percentage.of(1),
                  Percentage.of(1),
                  Percentage.of(1),
                  Percentage.of(1)
                ),
              ]
            )
          )
        : Err.of(
            ColorErrors.prepend<"background" | "layer">(layersColors, error)
          );
    });
}
