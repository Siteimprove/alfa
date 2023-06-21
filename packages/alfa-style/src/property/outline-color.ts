import { Color, Keyword } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

/**
 * @internal
 */
export type Specified = Color | Keyword<"invert">;

/**
 * @internal
 */
export type Computed = Color.Canonical | Keyword<"invert">;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/outline-color}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("invert"),
  Color.parse,
  (outlineColor) =>
    outlineColor.map((color) => {
      if (color.type === "keyword" && color.value === "invert") {
        return color;
      }

      return Resolver.color(color);
    })
);
