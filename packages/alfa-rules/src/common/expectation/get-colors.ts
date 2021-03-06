import { Element } from "@siteimprove/alfa-dom";
import { Device } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";
import { Current, Percentage, RGB, System } from "@siteimprove/alfa-css";
import { Style } from "@siteimprove/alfa-style";
import { Iterable } from "@siteimprove/alfa-iterable";

const { flatMap, map } = Iterable;

/**
 * Determine the approximate foreground colors of an element if possible.
 */
export function getForeground(
  element: Element,
  device: Device = Device.standard()
): Option<Iterable<RGB<Percentage, Percentage>>> {
  const style = Style.from(element, device);

  const color = resolveColor(style.computed("color").value, style);

  if (color.isNone()) {
    return None;
  }

  const opacity = style.computed("opacity").value;

  // If the color is not transparent, and the element is fully opaque,
  // then we do not need to dig further
  if (color.get().alpha.value * opacity.value === 1) {
    return Option.of([color.get()]);
  }

  // First, we mix the color with the element's background according to the
  // color's alpha channel (only).
  // For this, we fake the opacity of the element at 1. That way, the
  // background color is correctly handled. The background color may itself have
  // an alpha channel, independently from its opacity, and this alpha channel
  // needs to be taken into account (as well as the alpha/opacity of all the
  // previous layers).
  const colors = getBackground(element, device, 1).map((backdrops) =>
    map(backdrops, (backdrop) => composite(color.get(), backdrop, 1))
  );

  // Next, we handle the opacity of the element.
  // For this, we need the background colors of the parent (assuming that DOM
  // reflects layout).
  return colors.flatMap((colors) =>
    element
      .parent({
        flattened: true,
      })
      .filter(Element.isElement)
      .flatMap((parent) =>
        getBackground(parent, device).map((parentColors) =>
          flatMap(colors, (color) =>
            parentColors.map((backdrop) =>
              composite(color, backdrop, opacity.value)
            )
          )
        )
      )
  );
}

/**
 * Determine the approximate background color of an element if possible. It is
 * possible for multiple background colors to be returned, with each color
 * representing a possible background color of the element. Note that it is
 * possible that some of the colors will never manifest; they're simply a
 * worst-case guess at the possible colors that might.
 */
export function getBackground(
  element: Element,
  device: Device = Device.standard(),
  fakeLastOpacity?: number
): Option<Array<RGB<Percentage, Percentage>>> {
  // If the element has a text-shadow, we don't try to guess how it looks and
  // ask the user for help.
  if (
    Style.from(element, device).computed("text-shadow").value.type !== "keyword"
  ) {
    return None;
  }

  return getLayers(element, device, fakeLastOpacity).map((layers) =>
    layers.reduce<Array<RGB<Percentage, Percentage>>>(
      (backdrops, layer) =>
        layer.colors.reduce<Array<RGB<Percentage, Percentage>>>(
          (layers, color) =>
            layers.concat(
              backdrops.map((backdrop) =>
                composite(color, backdrop, layer.opacity)
              )
            ),
          []
        ),
      // We make the initial backdrop solid white as this can be assumed to be
      // the color of the canvas onto which the other backgrounds are rendered.
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
}

type Layer = {
  colors: ReadonlyArray<RGB<Percentage, Percentage>>;
  opacity: number;
};

function getLayers(
  element: Element,
  device: Device,
  fakeLastOpacity?: number
): Option<ReadonlyArray<Layer>> {
  const layers: Array<Layer> = [];

  const style = Style.from(element, device);

  const color = resolveColor(style.computed("background-color").value, style);
  const opacity = fakeLastOpacity ?? style.computed("opacity").value.value;

  if (color.isSome()) {
    layers.push({ colors: [color.get()], opacity });
  } else {
    return None;
  }

  for (const image of style.computed("background-image").value) {
    if (image.type === "keyword") {
      continue;
    }

    // We currently have no way of extracting colors from images, so we simply
    // bail out if we encounter a background image.
    if (image.image.type === "url") {
      return None;
    }

    // If there is a background-size, we currently have no way of guessing
    // whether it is large enough to go under the text or not.
    // So we simply bail out.
    if (
      !style
        .computed("background-size")
        .value.equals(style.initial("background-size").value)
    ) {
      return None;
    }

    // For each gradient, we extract all color stops into a background layer of
    // their own. As gradients need a start and an end point, there will always
    // be at least two color stops.
    const stops: Array<RGB<Percentage, Percentage>> = [];

    layers.push({ colors: stops, opacity });

    for (const item of image.image.items) {
      if (item.type === "stop") {
        const color = resolveColor(item.color, style);

        if (color.isSome()) {
          stops.push(color.get());
        } else {
          return None;
        }
      }
    }
  }

  // If the background layer does not have a lower layer that is fully opaque, we
  // need to also locate the background layers sitting behind the current layer.
  // As Alfa does not yet implement a layout system, we have to assume that the
  // DOM tree will reflect the layout at least to some extent; we therefore
  // simply use the background layers of the ancestors of the element.
  //
  // When we have a layout system in place, we should instead use Picasso
  // (https://github.com/siteimprove/picasso) for spatially indexing the box
  // tree in which case the background layers sitting behind the current layer
  // can be found by issuing a range query for the box of the current element.
  if (
    layers.length > 0 &&
    layers[0].opacity === 1 &&
    layers[0].colors.every((color) => color.alpha.value === 1)
  ) {
    return Option.of(layers);
  }

  const parent = element
    .parent({
      flattened: true,
    })
    .filter(Element.isElement);

  // Only use the background layers from the parent if there is one. If there
  // isn't, this means we're at the root. In that case, we simply return the
  // layers we've found so far.
  if (parent.isSome()) {
    return parent.flatMap((parent) =>
      // The fake opacity only applies to the last layer, so it is not used in
      // the recursive calls
      getLayers(parent, device).map((parentLayers) =>
        parentLayers.concat(layers)
      )
    );
  }

  return Option.of(layers);
}

function resolveColor(
  color: RGB<Percentage, Percentage> | Current | System,
  style: Style
): Option<RGB<Percentage, Percentage>> {
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
function composite(
  foreground: RGB<Percentage, Percentage>,
  background: RGB<Percentage, Percentage>,
  opacity: number
): RGB<Percentage, Percentage> {
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
