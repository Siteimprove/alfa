import { Array } from "@siteimprove/alfa-array";
import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Err, Result } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

import { getInterposedDescendant } from "../get-interposed-descendant";

import { Color } from "./color";
import { ColorError, ColorErrors } from "./color-error";

const { isElement } = Element;
const { hasTransparentBackground, isPositioned } = Style;

/**
 * @internal
 */
export class Layer {
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

/**
 * Gather all background layers of an element.
 * The layers can be set both by the element's own background property, and
 * by its ancestors, depending on transparency.
 * Since we do not have layout information, we simply assume that the DOM tree
 * ancestry mimics the actual layout of boxes.
 *
 *
 * @internal
 */
export function getLayers(
  element: Element,
  device: Device,
  context: Context = Context.empty(),
  // Possible override of the element's opacity.
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
