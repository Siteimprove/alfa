import {
  Color,
  Current,
  Keyword,
  Percentage,
  RGB,
  System,
} from "@siteimprove/alfa-css";

import { Property } from "../property";
import { Resolver } from "../resolver";

declare module "../property" {
  interface Longhands {
    "outline-color": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified = Color | Keyword<"invert">;

/**
 * @internal
 */
export type Computed =
  | RGB<Percentage, Percentage>
  | Current
  | System
  | Keyword<"invert">;

/**
 * @internal
 */
export const parse = Color.parse;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/outline-color}
 * @internal
 */
export default Property.register(
  "outline-color",
  Property.of<Specified, Computed>(
    Keyword.of("invert"),
    parse,
    (outlineColor) =>
      outlineColor.map((color) => {
        if (color.type === "keyword" && color.value === "invert") {
          return color;
        }

        return Resolver.color(color);
      })
  )
);
