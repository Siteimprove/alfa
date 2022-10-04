import { Array } from "@siteimprove/alfa-array";
import { Cache } from "@siteimprove/alfa-cache";
import { Percentage, RGB } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Option, None } from "@siteimprove/alfa-option";
import { Result, Err } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

import { getInterposedDescendant } from "../get-interposed-descendant";

import { Color } from "./color";
import { ColorError, ColorErrors } from "./color-error";

const { isElement } = Element;

const { hasTransparentBackground, isPositioned, isVisibleShadow } = Style;

class Layer {
  public static of(colors: Iterable<Color.Resolved>, opacity: number): Layer {
    return new Layer(Array.from(colors), opacity);
  }

  private readonly _colors: ReadonlyArray<Color.Resolved>;
  private readonly _opacity: number;

  private constructor(colors: ReadonlyArray<Color.Resolved>, opacity: number) {
    this._colors = colors;
    this._opacity = opacity;
  }

  public get colors(): ReadonlyArray<Color.Resolved> {
    return this._colors;
  }

  public get opacity(): number {
    return this._opacity;
  }
}

const layersCacheWithFakeOpacity = Cache.empty<
  Device,
  Cache<Context, Cache<Element, Result<Array<Layer>, ColorErrors<"layer">>>>
>();

const layersCacheWithDefaultOpacity = Cache.empty<
  Device,
  Cache<Context, Cache<Element, Result<Array<Layer>, ColorErrors<"layer">>>>
>();

function getLayers(
  element: Element,
  device: Device,
  context: Context = Context.empty(),
  opacity?: number
): Result<Array<Layer>, ColorErrors<"layer">> {
  const cache =
    opacity === undefined
      ? layersCacheWithDefaultOpacity
      : layersCacheWithFakeOpacity;

  return cache
    .get(device, Cache.empty)
    .get(context, Cache.empty)
    .get(element, () => {
      const style = Style.from(element, device, context);
      const backgroundColor = style.computed("background-color").value;
      const backgroundImage = style.computed("background-image").value;
      const backgroundSize = style.computed("background-size").value;

      const color = Color.resolve(backgroundColor, style);

      opacity = opacity ?? style.computed("opacity").value.value;

      const layers: Array<Layer> = [];
      const errors: Array<ColorError<"layer">> = [];

      if (color.isSome()) {
        layers.push(Layer.of([color.get()], opacity));
      } else {
        errors.push(
          ColorError.unresolvableBackgroundColor(element, backgroundColor)
        );
      }

      for (const image of backgroundImage) {
        if (image.type === "keyword") {
          continue;
        }

        // We currently have no way of extracting colors from images, so we simply
        // bail out if we encounter a background image.
        if (image.image.type === "url") {
          errors.push(
            ColorError.externalBackgroundImage(element, backgroundImage)
          );
          continue;
        }

        // If there is a background-size, we currently have no way of guessing
        // whether it is large enough to go under the text or not.
        // So we simply bail out.
        if (!backgroundSize.equals(style.initial("background-size").value)) {
          errors.push(ColorError.backgroundSize(element, backgroundSize));
          continue;
        }

        // For each gradient, we extract all color stops into a background layer of
        // their own. As gradients need a start and an end point, there will always
        // be at least two color stops.
        const stops: Array<Color.Resolved> = [];

        for (const item of image.image.items) {
          if (item.type === "stop") {
            const color = Color.resolve(item.color, style);

            if (color.isSome()) {
              stops.push(color.get());
            } else {
              errors.push(
                ColorError.unresolvableGradientStop(
                  element,
                  backgroundImage,
                  item.color
                )
              );
            }
          }
        }

        layers.push(Layer.of(stops, opacity));
      }

      if (
        errors.length === 0 &&
        layers.length > 0 &&
        layers.every(
          (layer) =>
            layer.opacity === 1 &&
            layer.colors.every((color) => color.alpha.value === 1)
        )
      ) {
        return Result.of<Array<Layer>, ColorErrors<"layer">>(layers);
      }

      if (isPositioned(device, "absolute", "fixed")(element)) {
        errors.push(
          ColorError.nonStaticPosition(
            element,
            style.computed("position").value
          )
        );
      }

      const interposedDescendants = getInterposedDescendant(
        device,
        element
      ).reject(hasTransparentBackground(device));

      if (!interposedDescendants.isEmpty()) {
        errors.push(
          ColorError.interposedDescendants(element, interposedDescendants)
        );
      }
      // If the background layer does not have a lower layer that is fully opaque,
      // we need to also locate the background layers sitting behind the current
      // layer.

      // Only use the background layers from the parent if there is one. If there
      // isn't, this means we're at the root. In that case, we simply return the
      // layers we've found so far.
      for (const parent of element.parent(Node.flatTree).filter(isElement)) {
        // The opacity override only applies to the last layer, so it is not
        // used in the recursive calls
        const layersColors = getLayers(parent, device, context);
        return errors.length === 0
          ? layersColors.map((parentLayers) => parentLayers.concat(layers))
          : Err.of(ColorErrors.prepend<"layer">(layersColors, errors));
      }

      return errors.length === 0
        ? Result.of<Array<Layer>, ColorErrors<"layer">>(layers)
        : Err.of(ColorErrors.of(errors));
    });
}

export type Foreground = Array<Color.Resolved>;

const foregroundCache = Cache.empty<
  Device,
  Cache<Context, Cache<Element, Result<Foreground, ColorErrors>>>
>();

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

      // First, we gather the background colors, even if we did not manage to
      // get a foreground colors, in order to have a list of all ColorError on
      // the way.
      const backgroundColors = getBackground(element, device, context, 1);

      // If we have both foreground and background color, we can merge them.
      if (color.isSome() && backgroundColors.isOk()) {
        // First, we mix the color with the element's background according to the
        // color's alpha channel (only).
        // For this, we fake the opacity of the element at 1. That way, the
        // background color is correctly handled. The background color may itself have
        // an alpha channel, independently of its opacity, and this alpha channel
        // needs to be taken into account (as well as the alpha/opacity of all the
        // previous layers).
        const colors = backgroundColors.map((background) =>
          background.map((backdrop) =>
            Color.composite(color.get(), backdrop, 1)
          )
        );

        for (const parent of element.parent(Node.flatTree).filter(isElement)) {
          // Next, we handle the opacity of the element.
          // For this, we need the background colors of the parent (assuming that DOM
          // reflects layout).
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

        return colors;
      } else {
        // We are missing either foreground or background.
        return Err.of(ColorErrors.prepend(backgroundColors, error));
      }
    });
}

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
