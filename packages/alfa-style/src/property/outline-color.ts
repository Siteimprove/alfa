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
 * {@link https://drafts.csswg.org/css-ui/#outline-color}
 * @internal
 */
export default Property.of<Specified, Computed>(
  Keyword.of("invert"),
  parse,
  (outlineColor) =>
    outlineColor.map((color) => {
      if (color.type === "keyword" && color.value === "invert") {
        return color;
      }

      return Resolver.color(color);
    })
);
