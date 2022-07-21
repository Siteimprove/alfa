import {
  Angle,
  Color,
  Converter,
  Current,
  Gradient,
  Image,
  Length,
  Linear,
  Numeric,
  Percentage,
  Position,
  Radial,
  RGB,
  System,
  URL,
} from "@siteimprove/alfa-css";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";
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
   * Resolve a percentage, according to a base numeric value
   */
  export function percentage<N extends Numeric = Numeric>(
    base: N
  ): Mapper<Percentage, N> {
    return (percentage) => base.scale(percentage.value) as N;
  }

  export function length2(style: Style): Mapper<Length, Length<"px">> {
    return (value) => length(value, style);
  }

  /**
   * Resolve a length in an arbitrary unit to a length in pixels.
   *
   * {@link https://drafts.csswg.org/css-values/#lengths}
   */
  export function length(length: Length, style: Style): Length<"px"> {
    const { unit, value } = length;
    const { viewport } = style.device;

    const fontSize = style.computed("font-size").value;

    switch (unit) {
      // https://www.w3.org/TR/css-values/#em
      case "em":
        return fontSize.scale(value);

      // https://www.w3.org/TR/css-values/#rem
      case "rem": {
        const rootFontSize = style.root().computed("font-size").value;

        return rootFontSize.scale(value);
      }

      // https://www.w3.org/TR/css-values/#ex
      case "ex":
      // https://www.w3.org/TR/css-values/#ch
      case "ch":
        return fontSize.scale(value * 0.5);

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
        const [red, green, blue] = [color.red, color.green, color.blue].map(
          (channel) =>
            Percentage.of(
              Real.clamp(
                channel.type === "number"
                  ? channel.value / 0xff
                  : channel.value,
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

  export function image(
    image: Image,
    style: Style
  ): Image<
    | URL
    | Linear<
        | Gradient.Hint<Percentage | Length<"px">>
        | Gradient.Stop<
            Current | System | RGB<Percentage, Percentage>,
            Percentage | Length<"px">
          >,
        Angle<"deg"> | Linear.Side | Linear.Corner
      >
    | Radial<
        | Gradient.Hint<Percentage | Length<"px">>
        | Gradient.Stop<
            Current | System | RGB<Percentage, Percentage>,
            Percentage | Length<"px">
          >,
        | Radial.Circle<Length<"px">>
        | Radial.Ellipse<Percentage | Length<"px">>
        | Radial.Extent,
        Position<
          | Percentage
          | Position.Center
          | Length<"px">
          | Position.Side<Position.Horizontal, Percentage | Length<"px">>,
          | Percentage
          | Position.Center
          | Length<"px">
          | Position.Side<Position.Vertical, Percentage | Length<"px">>
        >
      >
  > {
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

  export function position(
    position: Position,
    style: Style
  ): Position<
    | Percentage
    | Position.Center
    | Length<"px">
    | Position.Side<Position.Horizontal, Percentage | Length<"px">>,
    | Percentage
    | Position.Center
    | Length<"px">
    | Position.Side<Position.Vertical, Percentage | Length<"px">>
  > {
    return Position.of(
      positionComponent(position.horizontal, style),
      positionComponent(position.vertical, style)
    );
  }

  export function positionComponent<
    S extends Position.Horizontal | Position.Vertical
  >(
    position: Position.Component<S>,
    style: Style
  ):
    | Percentage
    | Position.Center
    | Length<"px">
    | Position.Side<S, Percentage | Length<"px">> {
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
