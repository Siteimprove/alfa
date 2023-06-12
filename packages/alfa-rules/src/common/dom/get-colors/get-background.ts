import { Cache } from "@siteimprove/alfa-cache";
import { Percentage, RGB } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Err, Result } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Set } from "@siteimprove/alfa-set";
import { Style } from "@siteimprove/alfa-style";

import { Color } from "./color";
import { ColorError, ColorErrors } from "./color-error";
import { Layer } from "./get-layers";
import { Iterable } from "@siteimprove/alfa-iterable";

const { isVisibleShadow } = Style;

/**
 * @public
 */
export type Background = ReadonlyArray<Color.Resolved>;

const backgroundCacheWithFakeOpacity = Cache.empty<
  Device,
  Cache<
    Context,
    Cache<
      Set<Element>,
      Cache<Element, Result<Background, ColorErrors<"background" | "layer">>>
    >
  >
>();

const backgroundCacheWithDefaultOpacity = Cache.empty<
  Device,
  Cache<
    Context,
    Cache<
      Set<Element>,
      Cache<Element, Result<Background, ColorErrors<"background" | "layer">>>
    >
  >
>();

/**
 * Get the background colors of an element by :
 * 1. gathering all layers, until a fully opaque one is found.
 * 2. merging them into one composite color
 *
 * @public
 */
export function getBackground(
  element: Element,
  device: Device,
  context: Context = Context.empty(),
  opacity?: number,
  ignoredInterposedDescendants: Set<Element> = Set.empty()
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
    .get(ignoredInterposedDescendants, Cache.empty)
    .get(element, () => {
      let error: Option<ColorError<"background">> = None;

      // If the element has a visible text-shadow, we don't try to guess how it looks.
      if (
        textShadow.type === "list" &&
        Iterable.some(textShadow, (shadow) => isVisibleShadow(shadow))
      ) {
        error = Option.of(ColorError.textShadow(element, textShadow));
      }

      // We want to gather layers errors even if we've already found one error.
      const layersColors = Layer.getLayers(
        element,
        device,
        context,
        opacity,
        ignoredInterposedDescendants
      );

      return error.isNone() && layersColors.isOk()
        ? layersColors.map((layers) => layers.reduce(Layer.merge, [white]))
        : Err.of(
            ColorErrors.prepend<"background" | "layer">(layersColors, error)
          );
    });
}

// We make the initial backdrop solid white as this can be assumed
// to be the color of the canvas onto which the other backgrounds
// are rendered.
const white = RGB.of(
  Percentage.of(1),
  Percentage.of(1),
  Percentage.of(1),
  Percentage.of(1)
);
