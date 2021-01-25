import { Element } from "@siteimprove/alfa-dom";
import { Device } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";
import { Current, Percentage, RGB, System } from "@siteimprove/alfa-css";
import { Style } from "@siteimprove/alfa-style";
import { Iterable } from "@siteimprove/alfa-iterable";

const { map } = Iterable;

/**
 * Determine the approximate foreground color of an element if possible.
 */
export function getForeground(
  element: Element,
  device: Device
): Option<Iterable<RGB<Percentage, Percentage>>> {
  const style = Style.from(element, device);

  const color = resolveColor(style.computed("color").value, style);

  if (color.isNone()) {
    return None;
  }

  if (color.get().alpha.value === 1) {
    return Option.of([color.get()]);
  }

  return getBackground(element, device).map((backdrops) =>
    map(backdrops, (backdrop) => composite(color.get(), backdrop))
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
  device: Device
): Option<Array<RGB<Percentage, Percentage>>> {
  return getLayers(element, device).map((layers) =>
    layers.reduce<Array<RGB<Percentage, Percentage>>>(
      (backdrops, layer) =>
        layer.reduce<Array<RGB<Percentage, Percentage>>>(
          (layers, color) =>
            layers.concat(
              backdrops.map((backdrop) => composite(color, backdrop))
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

function getLayers(
  element: Element,
  device: Device
): Option<Array<Array<RGB<Percentage, Percentage>>>> {
  const layers: Array<Array<RGB<Percentage, Percentage>>> = [];

  const style = Style.from(element, device);

  const color = resolveColor(style.computed("background-color").value, style);

  if (color.isSome()) {
    layers.push([color.get()]);
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

    // For each gradient, we extract all color stops into a background layer of
    // their own. As gradients need a start and an end point, there will always
    // be at least two color stops.
    const stops: Array<RGB<Percentage, Percentage>> = [];

    layers.push(stops);

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
  for (const layer of layers) {
    if (layer.every((color) => color.alpha.value === 1)) {
      return Option.of(layers);
    } else {
      break;
    }
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
  const opacity = style.computed("opacity").value;

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
              Percentage.of(color.alpha.value * opacity.value)
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
            Percentage.of(opacity.value)
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
          Percentage.of(color.alpha.value * opacity.value)
        )
      );
  }
}

/**
 * @see https://drafts.fxtf.org/compositing-1/#simplealphacompositing
 */
function composite(
  foreground: RGB<Percentage, Percentage>,
  background: RGB<Percentage, Percentage>
): RGB<Percentage, Percentage> {
  if (foreground.alpha.value === 1) {
    return foreground;
  }

  const alpha = background.alpha.value * (1 - foreground.alpha.value);

  const [red, green, blue] = [
    [foreground.red, background.red],
    [foreground.green, background.green],
    [foreground.blue, background.blue],
  ].map(([a, b]) => a.value * foreground.alpha.value + b.value * alpha);

  return RGB.of(
    Percentage.of(red),
    Percentage.of(green),
    Percentage.of(blue),
    Percentage.of(foreground.alpha.value + alpha)
  );
}
