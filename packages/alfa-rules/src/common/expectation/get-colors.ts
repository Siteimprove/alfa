import { Cache } from "@siteimprove/alfa-cache";
import { Current, Percentage, RGB, System } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Option, None } from "@siteimprove/alfa-option";
import { Result, Err } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

import { hasInterposedDescendant, isPositioned } from "../predicate";

type Color = RGB<Percentage, Percentage>;

namespace Color {
  export function resolve(
    color: Color | Current | System,
    style: Style
  ): Option<Color> {
    switch (color.type) {
      case "keyword":
        if (color.value === "currentcolor") {
          color = style.computed("color").value;

          if (color.type === "color") {
            return Option.of(
              RGB.of(
                color.red,
                color.green,
                color.blue,
                Percentage.of(color.alpha.value)
              )
            );
          }
        }

        if (color.value === "canvastext") {
          return Option.of(
            RGB.of(
              Percentage.of(0),
              Percentage.of(0),
              Percentage.of(0),
              Percentage.of(1)
            )
          );
        }

        return None;

      case "color":
        return Option.of(
          RGB.of(
            color.red,
            color.green,
            color.blue,
            Percentage.of(color.alpha.value)
          )
        );
    }
  }

  /**
   * {@link https://drafts.fxtf.org/compositing-1/#simplealphacompositing}
   */
  export function composite(
    foreground: Color,
    background: Color,
    opacity: number
  ): Color {
    const foregroundOpacity = foreground.alpha.value * opacity;

    if (foregroundOpacity === 1) {
      return foreground;
    }

    const alpha = background.alpha.value * (1 - foregroundOpacity);

    const [red, green, blue] = [
      [foreground.red, background.red],
      [foreground.green, background.green],
      [foreground.blue, background.blue],
    ].map(([a, b]) => a.value * foregroundOpacity + b.value * alpha);

    return RGB.of(
      Percentage.of(red),
      Percentage.of(green),
      Percentage.of(blue),
      Percentage.of(foregroundOpacity + alpha)
    );
  }
}

class Layer {
  public static of(colors: Iterable<Color>, opacity: number): Layer {
    return new Layer(Array.from(colors), opacity);
  }

  private readonly _colors: ReadonlyArray<Color>;
  private readonly _opacity: number;

  private constructor(colors: ReadonlyArray<Color>, opacity: number) {
    this._colors = colors;
    this._opacity = opacity;
  }

  public get colors(): ReadonlyArray<Color> {
    return this._colors;
  }

  public get opacity(): number {
    return this._opacity;
  }
}

namespace Layer {
  export enum Error {
    HasUnresolvableBackgroundColor = `Could not resolve background-color`,
    HasUnresolvableGradientStop = `Could not resolve gradient color stop`,
    HasBackgroundSize = `A background-size was encountered`,
    HasExternalBackgroundImage = `A background-image with a url() was encountered`,
    HasNonStaticPosition = `A non-statically positioned element was encountered`,
    HasInterposedDescendant = `An interposed descendant element was encountered`,
  }
}

function getLayers(
  element: Element,
  device: Device,
  context: Context = Context.empty(),
  opacity?: number
): Result<Array<Layer>, Layer.Error> {
  const style = Style.from(element, device, context);

  const color = Color.resolve(style.computed("background-color").value, style);

  opacity = opacity ?? style.computed("opacity").value.value;

  const layers: Array<Layer> = [];

  if (color.isSome()) {
    layers.push(Layer.of([color.get()], opacity));
  } else {
    return Err.of(Layer.Error.HasUnresolvableBackgroundColor);
  }

  for (const image of style.computed("background-image").value) {
    if (image.type === "keyword") {
      continue;
    }

    // We currently have no way of extracting colors from images, so we simply
    // bail out if we encounter a background image.
    if (image.image.type === "url") {
      return Err.of(Layer.Error.HasExternalBackgroundImage);
    }

    // If there is a background-size, we currently have no way of guessing
    // whether it is large enough to go under the text or not.
    // So we simply bail out.
    if (
      !style
        .computed("background-size")
        .value.equals(style.initial("background-size").value)
    ) {
      return Err.of(Layer.Error.HasBackgroundSize);
    }

    // For each gradient, we extract all color stops into a background layer of
    // their own. As gradients need a start and an end point, there will always
    // be at least two color stops.
    const stops: Array<Color> = [];

    for (const item of image.image.items) {
      if (item.type === "stop") {
        const color = Color.resolve(item.color, style);

        if (color.isSome()) {
          stops.push(color.get());
        } else {
          return Err.of(Layer.Error.HasUnresolvableGradientStop);
        }
      }
    }

    layers.push(Layer.of(stops, opacity));
  }

  if (
    layers.length > 0 &&
    layers.every(
      (layer) =>
        layer.opacity === 1 &&
        layer.colors.every((color) => color.alpha.value === 1)
    )
  ) {
    return Result.of(layers);
  }

  if (isPositioned(device, "absolute", "fixed")(element)) {
    return Err.of(Layer.Error.HasNonStaticPosition);
  }

  if (hasInterposedDescendant(device)(element)) {
    return Err.of(Layer.Error.HasInterposedDescendant);
  }

  // If the background layer does not have a lower layer that is fully opaque,
  // we need to also locate the background layers sitting behind the current
  // layer.

  // Only use the background layers from the parent if there is one. If there
  // isn't, this means we're at the root. In that case, we simply return the
  // layers we've found so far.
  for (const parent of element
    .parent({
      flattened: true,
    })
    .filter(Element.isElement)) {
    // The opacity override only applies to the last layer, so it is not
    // used in the recursive calls
    return getLayers(parent, device, context).map((parentLayers) =>
      parentLayers.concat(layers)
    );
  }

  return Result.of(layers);
}

export type Foreground = Array<Color>;

export namespace Foreground {
  export enum Error {
    HasUnresolvableColor = `Could not resolve color`,
  }
}

const foregroundCache = Cache.empty<
  Device,
  Cache<
    Context,
    Cache<
      Element,
      Result<Foreground, Layer.Error | Foreground.Error | Background.Error>
    >
  >
>();

export function getForeground(
  element: Element,
  device: Device,
  context: Context = Context.empty()
): Result<Foreground, Layer.Error | Foreground.Error | Background.Error> {
  return foregroundCache
    .get(device, Cache.empty)
    .get(context, Cache.empty)
    .get(element, () => {
      const style = Style.from(element, device, context);

      const color = Color.resolve(style.computed("color").value, style);

      if (color.isNone()) {
        return Err.of(Foreground.Error.HasUnresolvableColor);
      }

      const opacity = style.computed("opacity").value;

      // If the color is not transparent, and the element is fully opaque,
      // then we do not need to dig further
      if (color.get().alpha.value * opacity.value === 1) {
        const result: Result<
          Foreground,
          Layer.Error | Foreground.Error | Background.Error
        > = Result.of([color.get()]);
        return result;
      }

      if (hasInterposedDescendant(device)(element)) {
        return Err.of(Layer.Error.HasInterposedDescendant);
      }
      // First, we mix the color with the element's background according to the
      // color's alpha channel (only).
      // For this, we fake the opacity of the element at 1. That way, the
      // background color is correctly handled. The background color may itself have
      // an alpha channel, independently from its opacity, and this alpha channel
      // needs to be taken into account (as well as the alpha/opacity of all the
      // previous layers).
      const colors = getBackground(element, device, context, 1).map(
        (background) =>
          background.map((backdrop) =>
            Color.composite(color.get(), backdrop, 1)
          )
      );

      for (const parent of element
        .parent({
          flattened: true,
        })
        .filter(Element.isElement)) {
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
    });
}

export type Background = Array<Color>;

export namespace Background {
  export enum Error {
    HasTextShadow = `A text-shadow was encountered`,
  }
}

const backgroundCacheWithFakeOpacity = Cache.empty<
  Device,
  Cache<
    Context,
    Cache<Element, Result<Background, Layer.Error | Background.Error>>
  >
>();

const backgroundCacheWithDefaultOpacity = Cache.empty<
  Device,
  Cache<
    Context,
    Cache<Element, Result<Background, Layer.Error | Background.Error>>
  >
>();
export function getBackground(
  element: Element,
  device: Device,
  context: Context = Context.empty(),
  opacity?: number
): Result<Background, Layer.Error | Background.Error> {
  const cache =
    opacity === 1
      ? backgroundCacheWithFakeOpacity
      : backgroundCacheWithDefaultOpacity;
  return cache
    .get(device, Cache.empty)
    .get(context, Cache.empty)
    .get(element, () => {
      // If the element has a text-shadow, we don't try to guess how it looks.
      if (
        Style.from(element, device, context).computed("text-shadow").value
          .type !== "keyword"
      ) {
        return Err.of(Background.Error.HasTextShadow);
      }

      if (hasInterposedDescendant(device)(element)) {
        return Err.of(Layer.Error.HasInterposedDescendant);
      }

      return getLayers(element, device, context, opacity).map((layers) =>
        layers.reduce(
          (backdrops, layer) =>
            layer.colors.reduce(
              (layers, color) =>
                layers.concat(
                  backdrops.map((backdrop) =>
                    Color.composite(color, backdrop, layer.opacity)
                  )
                ),
              [] as Array<Color>
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
      );
    });
}
