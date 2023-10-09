import {
  Gradient,
  Image,
  Length,
  LengthPercentage,
  Position,
  Unit,
  URL,
} from "@siteimprove/alfa-css";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";

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
  function lengthResolver(
    style: Style
  ): Mapper<Length.Fixed<Unit.Length.Relative>, Length.Canonical> {
    const { viewport } = style.device;
    const width = Length.of(viewport.width, "px");
    const height = Length.of(viewport.height, "px");

    const fontSize = style.computed("font-size").value;
    const rootFontSize = style.root().computed("font-size").value;

    return Length.resolver(fontSize, rootFontSize, width, height);
  }

  export function length(style: Style): Length.Resolver {
    return { length: lengthResolver(style) };
  }

  export function lengthPercentage(
    base: Length.Canonical,
    style: Style
  ): LengthPercentage.Resolver {
    return { percentageBase: base, length: lengthResolver(style) };
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
        // @ts-ignore
        return Image.of(
          Gradient.Linear.partiallyResolve(length(style))(gradient)
        );

      case "radial":
        // @ts-ignore
        return Image.of(
          Gradient.Radial.partiallyResolve(length(style))(gradient)
        );
    }
  }

  export function position(
    position: Position.Fixed,
    style: Style
  ): Position.Fixed {
    return Position.of(
      positionComponent(position.horizontal, style),
      positionComponent(position.vertical, style)
    );
  }

  export function positionComponent<
    S extends Position.Keywords.Horizontal | Position.Keywords.Vertical
  >(
    position: Position.Component.Fixed<S>,
    style: Style
  ): Position.Component.Fixed<S> {
    switch (position.type) {
      case "keyword":
        return position;

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
