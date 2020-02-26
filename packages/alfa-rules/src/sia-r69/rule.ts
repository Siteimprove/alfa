import { Rule } from "@siteimprove/alfa-act";
import { RGB, Percentage, Current, System } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Text, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Option, None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasNamespace } from "../common/predicate/has-namespace";
import { hasParent } from "../common/predicate/has-parent";
import { isIgnored } from "../common/predicate/is-ignored";
import { isVisible } from "../common/predicate/is-visible";

import { Question } from "../common/question";

const { reduce, some, flatMap, map, filter, concat } = Iterable;
const { and, not, equals } = Predicate;
const { min, max } = Math;

export default Rule.Atomic.of<Page, Text, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r69.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return filter(
          document.descendants({ flattened: true, nested: true }),
          and(
            Text.isText,
            and(
              hasParent(
                and(Element.isElement, hasNamespace(equals(Namespace.HTML))),
                { flattened: true }
              ),
              and(isVisible(device), not(isIgnored(device)))
            )
          )
        );
      },

      expectations(target) {
        const foregrounds = Question.of(
          "foreground-colors",
          "color[]",
          target,
          "What are the foreground colors of the text node?"
        );

        const backgrounds = Question.of(
          "background-colors",
          "color[]",
          target,
          "What are the background colors of the text node?"
        );

        const result = foregrounds.map(foregrounds =>
          backgrounds.map(backgrounds => {
            const contrasts = flatMap(foregrounds, foreground =>
              map(backgrounds, background => contrast(foreground, background))
            );

            const highest = reduce(
              contrasts,
              (lowest, contrast) => max(lowest, contrast),
              0
            );

            return expectation(
              highest >= 4.5,
              Outcomes.HasSufficientContrast,
              Outcomes.HasInsufficientContrast
            );
          })
        );

        const parent = target.parent({ flattened: true }).get() as Element;

        return {
          1: getForeground(parent, device)
            .map(foreground => result.answer(foreground))
            .flatMap(result =>
              getBackground(parent, device).map(background =>
                result.answer(background)
              )
            )
            .getOr(result)
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasSufficientContrast = Ok.of(
    "The highest possible contrast of the text is sufficient"
  );

  export const HasInsufficientContrast = Err.of(
    "The highest possible contrast of the text is insufficient"
  );
}

/**
 * Determine the approximate foreground color of an element if possible.
 */
function getForeground(
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

  return getBackground(element, device).map(backdrops =>
    map(backdrops, backdrop => composite(color.get(), backdrop))
  );
}

/**
 * Determine the approximate background color of an element if possible. It is
 * possible for multiple background colors to be returned, with each color
 * representing a possible background color of the element. Note that it is
 * possible that some of colors will actually never manifest; they're simply a
 * worst-case guess at the possible colors that might.
 */
function getBackground(
  element: Element,
  device: Device
): Option<Iterable<RGB<Percentage, Percentage>>> {
  return getLayers(element, device).map(layers => [
    ...reduce<Iterable<RGB<Percentage, Percentage>>>(
      layers,
      (backdrops, layer) =>
        flatMap(layer, color =>
          map(backdrops, backdrop => composite(color, backdrop))
        ),
      // We make the initial backdrop solid white as this can be assumed to be
      // the color of the canvas onto which the other backgrounds are rendered.
      [
        RGB.of(
          Percentage.of(1),
          Percentage.of(1),
          Percentage.of(1),
          Percentage.of(1)
        )
      ]
    )
  ]);
}

function getLayers(
  element: Element,
  device: Device
): Option<Iterable<Iterable<RGB<Percentage, Percentage>>>> {
  const layers: Array<Iterable<RGB<Percentage, Percentage>>> = [];

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

  // If any color within the current background layer is not fully opaque, we
  // need to also locate the background layers sitting behind the current layer.
  // As Alfa does not yet implement a layout system, we have to assume that the
  // DOM tree will reflect the layout at least to some extent; we therefore
  // simply use the background layers of the ancestors of the element.
  //
  // When we have a layout system in place, we should instead use Picasso
  // (https://github.com/siteimprove/picasso) for spatially indexing the box
  // tree in which case the background layers sitting behind the current layer
  // can be found by issuing a range query for the box of the current element.
  if (some(layers, layer => some(layer, color => color.alpha.value !== 1))) {
    const parent = element
      .parent({
        flattened: true
      })
      .filter(Element.isElement);

    // Only use the background layers from the parent if there is one. If there
    // isn't, this means we're at the root. In that case, we simply return the
    // layers we've found so far.
    if (parent.isSome()) {
      return parent.flatMap(parent =>
        getLayers(parent, device).map(parentLayers =>
          concat(parentLayers, layers)
        )
      );
    }
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
          return Option.of(color);
        }
      }

      return None;

    case "color":
      return Option.of(color);
  }
}

/**
 * @see https://drafts.fxtf.org/compositing-1/#simplealphacompositing
 */
function composite(
  foreground: RGB,
  background: RGB
): RGB<Percentage, Percentage> {
  const alpha = background.alpha.value * (1 - foreground.alpha.value);

  const [red, green, blue] = [
    [foreground.red, background.red],
    [foreground.green, background.green],
    [foreground.blue, background.blue]
  ].map(components => {
    const [a, b] = components.map(c =>
      c.type === "number" ? c.value / 0xff : c.value
    );

    return a * foreground.alpha.value + b * alpha;
  });

  return RGB.of(
    Percentage.of(red),
    Percentage.of(green),
    Percentage.of(blue),
    Percentage.of(foreground.alpha.value + alpha)
  );
}

/**
 * @see https://w3c.github.io/wcag/guidelines/#dfn-relative-luminance
 */
function luminance(color: RGB): number {
  const [red, green, blue] = [color.red, color.green, color.blue].map(c => {
    const component = c.type === "number" ? c.value / 0xff : c.value;

    return component <= 0.03928
      ? component / 12.92
      : Math.pow((component + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/**
 * @see https://w3c.github.io/wcag/guidelines/#dfn-contrast-ratio
 */
function contrast(foreground: RGB, background: RGB): number {
  const lf = luminance(foreground);
  const lb = luminance(background);

  return (max(lf, lb) + 0.05) / (min(lf, lb) + 0.05);
}
