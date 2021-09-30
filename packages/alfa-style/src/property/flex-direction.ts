import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

declare module "../property" {
  interface Longhands {
    "flex-direction": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified =
  | Keyword<"row">
  | Keyword<"row-reverse">
  | Keyword<"column">
  | Keyword<"column-reverse">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse(
  "row",
  "row-reverse",
  "column",
  "column-reverse"
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap}
 * @internal
 */
export default Property.register(
  "flex-direction",
  Property.of<Specified, Computed>(
    Keyword.of("row"),
    parse,
    (position) => position
  )
);
