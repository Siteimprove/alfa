import { Array } from "@siteimprove/alfa-array";
import { Cache } from "@siteimprove/alfa-cache";
import { Color, CSS4Color } from "@siteimprove/alfa-css";
import type { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Err, Result } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Set } from "@siteimprove/alfa-set";
import { Style } from "@siteimprove/alfa-style";

import { getInterposedDescendant } from "../get-interposed-descendant.js";

import { ColorError, ColorErrors } from "./color-error.js";

const { isElement } = Element;
const { hasTransparentBackground, isPositioned } = Style;

/**
 * @public
 */
export class Layer {
  public static of(
    colors: Iterable<CSS4Color.Canonical>,
    opacity: number,
  ): Layer {
    return new Layer(Array.from(colors), opacity);
  }

  private readonly _colors: ReadonlyArray<CSS4Color.Canonical>;
  private readonly _opacity: number;

  protected constructor(
    colors: ReadonlyArray<CSS4Color.Canonical>,
    opacity: number,
  ) {
    this._colors = colors;
    this._opacity = opacity;
  }

  public get colors(): ReadonlyArray<CSS4Color.Canonical> {
    return this._colors;
  }

  public get opacity(): number {
    return this._opacity;
  }
}

/**
 * @public
 */
export namespace Layer {
  const layersCacheWithFakeOpacity = Cache.empty<
    Device,
    Cache<
      Context,
      Cache<
        Set<Element>,
        Cache<Element, Result<Array<Layer>, ColorErrors<"layer">>>
      >
    >
  >();

  const layersCacheWithDefaultOpacity = Cache.empty<
    Device,
    Cache<
      Context,
      Cache<
        Set<Element>,
        Cache<Element, Result<Array<Layer>, ColorErrors<"layer">>>
      >
    >
  >();

  /**
   * Gather all background layers of an element.
   * The layers can be set both by the element's own background property, and
   * by its ancestors, depending on transparency.
   * Since we do not have layout information, we simply assume that the DOM tree
   * ancestry mimics the actual layout of boxes.
   */
  export function getLayers(
    element: Element,
    device: Device,
    context: Context = Context.empty(),
    // Possible override of the element's opacity.
    opacity?: number,
    ignoredInterposedDescendants: Set<Element> = Set.empty(),
  ): Result<Array<Layer>, ColorErrors<"layer">> {
    const cache =
      opacity === undefined
        ? layersCacheWithDefaultOpacity
        : layersCacheWithFakeOpacity;

    return cache
      .get(device, Cache.empty)
      .get(context, Cache.empty)
      .get(ignoredInterposedDescendants, Cache.empty)
      .get(element, () => {
        const style = Style.from(element, device, context);
        const currentLayers = getCurrentLayers(
          element,
          device,
          context,
          opacity,
        );

        const layers: Array<Layer> = currentLayers.getOr([]);
        const errors: Array<ColorError<"layer">> = currentLayers.getErrOr([]);

        // If the current layer is fully opaque, no need to go further
        if (
          errors.length === 0 &&
          layers.length > 0 &&
          layers.every(
            (layer) =>
              layer.opacity === 1 &&
              layer.colors.every((color) => color.alpha.value === 1),
          )
        ) {
          return Result.of<Array<Layer>, ColorErrors<"layer">>(layers);
        }

        // If the current element is positioned,
        // we don't know exactly where it stands and bail out.
        if (isPositioned(device, "absolute", "fixed")(element)) {
          errors.push(
            ColorError.nonStaticPosition(
              element,
              style.computed("position").value,
            ),
          );
        }

        // If the current element has interposed descendants that:
        // 1. have non-transparent background; and
        // 2. should not be ignored,
        // we don't know exactly where they are and bail out.
        const interposedDescendants = getInterposedDescendant(device, element)
          .reject(hasTransparentBackground(device))
          .reject(
            ignoredInterposedDescendants.has.bind(ignoredInterposedDescendants),
          );

        if (!interposedDescendants.isEmpty()) {
          errors.push(
            ColorError.interposedDescendants(element, interposedDescendants),
          );
        }

        // If the background layer does not have a lower layer that is fully opaque,
        // we need to also locate the layers sitting behind, i.e. one the parent.
        for (const parent of element.parent(Node.flatTree).filter(isElement)) {
          const layersColors = getLayers(
            parent,
            device,
            context,
            // The opacity override only applies to the last layer, so it is not
            // used in the recursive calls
            undefined,
            ignoredInterposedDescendants,
          );

          return errors.length === 0
            ? layersColors.map((parentLayers) => parentLayers.concat(layers))
            : Err.of(ColorErrors.prepend<"layer">(layersColors, errors));
        }

        // If there is no parent, this means we're at the root. In that case,
        // we simply return the layers we've found so far.
        return errors.length === 0
          ? Result.of<Array<Layer>, ColorErrors<"layer">>(layers)
          : Err.of(ColorErrors.of(errors));
      });
  }

  /**
   * Merge colors in a layer with colors in an existing backdrop.
   */
  export function merge(
    backdrops: Array<CSS4Color.Canonical>,
    layer: Layer,
  ): Array<CSS4Color.Canonical> {
    return layer.colors.reduce(
      (layers, color) =>
        layers.concat(
          backdrops.map((backdrop) =>
            Color.composite(color, backdrop, layer.opacity),
          ),
        ),
      [] as Array<CSS4Color.Canonical>,
    );
  }

  /**
   * Get the layers defined on a element (in its background property).
   *
   * @private
   */
  function getCurrentLayers(
    element: Element,
    device: Device,
    context: Context = Context.empty(),
    // Possible override of the element's opacity.
    opacity?: number,
  ): Result<Array<Layer>, Array<ColorError<"layer">>> {
    const style = Style.from(element, device, context);
    const backgroundColor = style.used("background-color").value;
    const backgroundImage = style.computed("background-image").value;
    const backgroundSize = style.computed("background-size").value;

    opacity = opacity ?? style.computed("opacity").value.value;

    const layers: Array<Layer> = [];
    const errors: Array<ColorError<"layer">> = [];

    layers.push(Layer.of([backgroundColor], opacity));

    for (const image of backgroundImage) {
      if (image.type === "keyword") {
        continue;
      }

      // We currently have no way of extracting colors from images, so we simply
      // bail out if we encounter a background image.
      if (image.image.type === "url") {
        // If the URL is empty, it will be discarded by the browser and no image
        // will be displayed, so we ignore it.
        if (image.image.url !== "") {
          errors.push(
            ColorError.externalBackgroundImage(element, backgroundImage),
          );
        }
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
      const stops: Array<CSS4Color.Canonical> = [];

      for (const item of image.image.items) {
        if (item.type === "stop") {
          stops.push(
            Color.resolve({
              currentColor: style.used("color").value,
            })(item.color),
          );
        }
      }

      layers.push(Layer.of(stops, opacity));
    }

    return errors.length === 0 ? Result.of(layers) : Err.of(errors);
  }
}
