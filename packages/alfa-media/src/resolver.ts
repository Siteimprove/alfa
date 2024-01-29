import { Length } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";

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
   *
   * @remarks
   * Relative lengths in media queries are based on initial values of the
   * associated properties. They are hard-coded here to avoid circular dependcy
   * to @siteimprove/alfa-style.
   */
  export function length(device: Device): Length.Resolver {
    const { viewport } = device;
    const width = Length.of(viewport.width, "px");
    const height = Length.of(viewport.height, "px");

    const fontSize = Length.of(16, "px");
    const rootFontSize = Length.of(16, "px");

    return { length: Length.resolver(fontSize, rootFontSize, width, height) };
  }
}
