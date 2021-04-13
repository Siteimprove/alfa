import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

declare module "../property" {
  interface Longhands {
    "text-align": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified =
  | Keyword<"start">
  | Keyword<"end">
  | Keyword<"left">
  | Keyword<"right">
  | Keyword<"center">
  | Keyword<"justify">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse(
  "start",
  "end",
  "left",
  "right",
  "center",
  "justify"
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-align}
 * @internal
 */
export default Property.register(
  "text-align",
  Property.of<Specified, Computed>(
    Keyword.of("start"),
    parse,
    (textAlign) => textAlign,
    {
      inherits: true,
    }
  )
);
