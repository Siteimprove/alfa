import {
  Color,
  type LengthPercentage,
  Shadow,
  type Unit,
  type Value,
} from "@siteimprove/alfa-css";
import { Length, List } from "@siteimprove/alfa-css";
import type { Mapper } from "@siteimprove/alfa-mapper";

import type { Style } from "./style.js";

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
   * * root relative units depend on style.root().computed("font-size");
   * * other relative units depend on style.computed("font-size");
   *
   * In nearly all cases, the style is the element's own style, except for
   * resolving font-size itself, in which case the parent's style is used.
   * Since the resolver doesn't know which property is resolved, the onus of
   * providing the correct style is left on the caller.
   *
   * {@link https://drafts.csswg.org/css-values/#relative-lengths}
   */
  function lengthResolver(
    style: Style,
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
    style: Style,
  ): LengthPercentage.Resolver {
    return { percentageBase: base, length: lengthResolver(style) };
  }

  /**
   * Resolve layers for properties that uses layering like background and mask.
   *
   * The number of layers is determined by the number of comma separated values
   * in the property where the image is specified, i.e. `background-image` or `mask-image`.
   *
   * If there are more values than layers, the excess values are discarded.
   * Otherwise, the values must be repeated until the number of values matches the number of layers.
   *
   * {@link https://www.w3.org/TR/css-backgrounds-3/#layering}
   * {@link https://drafts.fxtf.org/css-masking/#layering}.
   *
   * @internal
   */
  export function layers(
    style: Style,
    name: "mask-image" | "background-image",
  ) {
    return <V extends Value>(value: List<V>): List<V> =>
      value.cutOrExtend(Math.max(style.computed(name).value.size, 1));
  }

  export function color(style: Style): Color.Resolver {
    return { currentColor: style.used("color").value };
  }

  export function shadow(style: Style): Shadow.Resolver {
    return { ...length(style), ...color(style) };
  }
}
