import type { LengthPercentage, Unit } from "@siteimprove/alfa-css";
import { Length } from "@siteimprove/alfa-css";
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
}
