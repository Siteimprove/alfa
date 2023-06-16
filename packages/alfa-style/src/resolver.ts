import {
  Color,
  Gradient,
  Image,
  Length,
  Linear,
  Percentage,
  Position,
  Radial,
  RGB,
  URL,
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
   * Absolute lengths are left untouched, and normalised into "px".
   * Relative lengths resolution depends on another length which is passed as
   * part of a Style:
   * * viewport dimensions are fetch from style.device;
   * * root relative depend on style.root().computed("font-size");
   * * other relative unit depend on style.computed("font-size");
   *
   * In nearly all cases, the style is the element's own style, except for
   * resolving font-size itself, in which case the parent's style is used.
   * Since the resolver doesn't know which property is resolved, the onus of
   * providing the correct style is left on the caller.
   *
   * {@link https://drafts.csswg.org/css-values/#relative-lengths}
   */
  export function length(style: Style): Length.Resolver {
    const { viewport } = style.device;
    const width = Length.of(viewport.width, "px");
    const height = Length.of(viewport.height, "px");

    const fontSize = style.computed("font-size").value;
    const rootFontSize = style.root().computed("font-size").value;

    return Length.resolver(fontSize, rootFontSize, width, height);
  }

  /**
   * {@link https://drafts.csswg.org/css-color/#resolving-color-values}
   */
  export function color(color: Color): Color.Canonical {
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
  ): Image<URL | Gradient.Canonical> {
    switch (image.image.type) {
      case "url":
        return Image.of(image.image);

      case "gradient":
        return gradient(image.image, style);
    }
  }

  function gradient(
    gradient: Gradient,
    style: Style
  ): Image<Gradient.Canonical> {
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
            position.type === "length"
              ? position.resolve(length(style))
              : position
          )
        );

      case "hint": {
        return Gradient.Hint.of(
          item.position.type === "length"
            ? item.position.resolve(length(style))
            : item.position
        );
      }
    }
  }

  function gradientShape(shape: Radial.Shape, style: Style) {
    switch (shape.type) {
      case "circle":
        return Radial.Circle.of(shape.radius.resolve(length(style)));

      case "ellipse":
        return Radial.Ellipse.of(
          shape.horizontal.type === "length"
            ? shape.horizontal.resolve(length(style))
            : shape.horizontal,
          shape.vertical.type === "length"
            ? shape.vertical.resolve(length(style))
            : shape.vertical
        );

      case "extent":
        return shape;
    }
  }

  export function position(
    position: Position,
    style: Style
  ): Position.Canonical {
    return Position.of(
      positionComponent(position.horizontal, style),
      positionComponent(position.vertical, style)
    );
  }

  export function positionComponent<
    S extends Position.Keywords.Horizontal | Position.Keywords.Vertical
  >(
    position: Position.Component<S>,
    style: Style
  ): Position.Component.Canonical<S> {
    switch (position.type) {
      case "keyword":
      case "percentage":
        return position;

      case "length":
        return position.resolve(Resolver.length(style));

      case "side":
        return Position.Side.of(
          position.side,
          position.offset.map((offset) => {
            switch (offset.type) {
              case "percentage":
                return offset;

              case "length":
                return offset.resolve(Resolver.length(style));
            }
          })
        );
    }
  }
}
