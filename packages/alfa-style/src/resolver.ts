import {
  Color,
  Converter,
  Current,
  Gradient,
  Image,
  Length,
  Linear,
  Percentage,
  Position,
  Radial,
  RGB,
  System,
} from "@siteimprove/alfa-css";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Real } from "@siteimprove/alfa-math";

import { Style } from "./style";

/**
 * Resolvers are functions that resolve values to their canonical, computed
 * representation.
 *
 * @internal
 */
export namespace Resolver {
  /**
   * Resolve a length in an arbitrary unit to a length in pixels.
   *
   * {@link https://drafts.csswg.org/css-values/#lengths}
   */
  export function length(length: Length, style: Style): Length<"px"> {
    const { unit, value } = length;
    const { viewport } = style.device;

    const { value: fontSize } = style.computed("font-size");

    switch (unit) {
      // https://www.w3.org/TR/css-values/#em
      case "em":
        return Length.of(fontSize.value * value, fontSize.unit);

      // https://www.w3.org/TR/css-values/#rem
      case "rem": {
        const { value: rootFontSize } = style.root().computed("font-size");

        return Length.of(rootFontSize.value * value, fontSize.unit);
      }

      // https://www.w3.org/TR/css-values/#ex
      case "ex":
      // https://www.w3.org/TR/css-values/#ch
      case "ch":
        return Length.of(fontSize.value * value * 0.5, fontSize.unit);

      // https://www.w3.org/TR/css-values/#vh
      case "vh":
        return Length.of((viewport.height * value) / 100, "px");

      // https://www.w3.org/TR/css-values/#vw
      case "vw":
        return Length.of((viewport.width * value) / 100, "px");

      // https://www.w3.org/TR/css-values/#vmin
      case "vmin":
        return Length.of(
          (Math.min(viewport.width, viewport.height) * value) / 100,
          "px"
        );

      // https://www.w3.org/TR/css-values/#vmax
      case "vmax":
        return Length.of(
          (Math.max(viewport.width, viewport.height) * value) / 100,
          "px"
        );
    }

    return Length.of(Converter.length(value, unit, "px"), "px");
  }

  /**
   * {@link https://drafts.csswg.org/css-color/#resolving-color-values}
   */
  export function color(
    color: Color
  ): Current | System | RGB<Percentage, Percentage> {
    switch (color.type) {
      case "color": {
        const [red, green, blue] = [
          color.red,
          color.green,
          color.blue,
        ].map((channel) =>
          Percentage.of(
            Real.clamp(
              channel.type === "number" ? channel.value / 0xff : channel.value,
              0,
              1
            )
          )
        );

        return RGB.of(
          red,
          green,
          blue,
          Percentage.of(Real.clamp(color.alpha.value, 0, 1))
        );
      }

      case "keyword":
        return color;
    }
  }

  export function image(image: Image, style: Style) {
    switch (image.image.type) {
      case "url":
        return Image.of(image.image);

      case "gradient":
        return gradient(image.image, style);
    }
  }

  function gradient(gradient: Gradient, style: Style) {
    switch (gradient.kind) {
      case "linear":
        return Image.of(
          Linear.of(
            gradient.direction.type === "angle"
              ? gradient.direction.withUnit("deg")
              : gradient.direction,
            Iterable.map(gradient.items, (item) => gradientItem(item, style)),
            gradient.repeats
          )
        );

      case "radial":
        return Image.of(
          Radial.of(
            gradientShape(gradient.shape, style),
            position(gradient.position, style),
            Iterable.map(gradient.items, (item) => gradientItem(item, style)),
            gradient.repeats
          )
        );
    }
  }

  function gradientItem(item: Gradient.Item, style: Style) {
    switch (item.type) {
      case "stop":
        return Gradient.Stop.of(
          Resolver.color(item.color),
          item.position.map((position) =>
            position.type === "length" ? length(position, style) : position
          )
        );

      case "hint": {
        return Gradient.Hint.of(
          item.position.type === "length"
            ? length(item.position, style)
            : item.position
        );
      }
    }
  }

  function gradientShape(shape: Radial.Shape, style: Style) {
    switch (shape.type) {
      case "circle":
        return Radial.Circle.of(length(shape.radius, style));

      case "ellipse":
        return Radial.Ellipse.of(
          shape.horizontal.type === "length"
            ? length(shape.horizontal, style)
            : shape.horizontal,
          shape.vertical.type === "length"
            ? length(shape.vertical, style)
            : shape.vertical
        );

      case "extent":
        return shape;
    }
  }

  export function position(position: Position, style: Style) {
    return Position.of(
      positionComponent(position.horizontal, style),
      positionComponent(position.vertical, style)
    );
  }

  export function positionComponent<
    S extends Position.Horizontal | Position.Vertical
  >(position: Position.Component<S>, style: Style) {
    switch (position.type) {
      case "keyword":
      case "percentage":
        return position;

      case "length":
        return Resolver.length(position, style);

      case "side":
        return Position.Side.of(
          position.side,
          position.offset.map((offset) => {
            switch (offset.type) {
              case "percentage":
                return offset;

              case "length":
                return Resolver.length(offset, style);
            }
          })
        );
    }
  }
}
