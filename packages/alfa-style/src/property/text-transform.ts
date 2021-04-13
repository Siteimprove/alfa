import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

declare module "../property" {
  interface Longhands {
    "text-transform": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified =
  | Keyword<"none">
  | Keyword<"capitalize">
  | Keyword<"uppercase">
  | Keyword<"lowercase">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse(
  "none",
  "capitalize",
  "uppercase",
  "lowercase"
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform}
 */
export default Property.register(
  "text-transform",
  Property.of<Specified, Computed>(
    Keyword.of("none"),
    parse,
    (textTransform) => textTransform,
    {
      inherits: true,
    }
  )
);
