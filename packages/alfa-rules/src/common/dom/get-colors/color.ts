import {
  Color as CSSColor,
  CSS4Color,
  Percentage,
} from "@siteimprove/alfa-css";
import { None, Option } from "@siteimprove/alfa-option";
import type { Style } from "@siteimprove/alfa-style";

/**
 * @public
 */
export namespace Color {
  export type Computed = CSSColor.Canonical;

  export type Resolved = CSS4Color.Canonical;

  export function resolve(color: Computed, style: Style): Option<Resolved> {
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
   * {@link https://drafts.fxtf.org/compositing-1/#simplealphacompositing}
   */
  export function composite(
    foreground: Resolved,
    background: Resolved,
    opacity: number,
  ): Resolved {
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

    return CSSColor.rgb(
      Percentage.of(red),
      Percentage.of(green),
      Percentage.of(blue),
      Percentage.of(foregroundOpacity + alpha),
    );
  }
}
