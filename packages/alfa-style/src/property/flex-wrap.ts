import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

declare module "../property" {
  interface Longhands {
    "flex-wrap": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified =
  | Keyword<"nowrap">
  | Keyword<"wrap">
  | Keyword<"wrap-reverse">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse("nowrap", "wrap", "wrap-reverse");

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap}
 * @internal
 */
export default Property.register(
  "flex-wrap",
  Property.of<Specified, Computed>(
    Keyword.of("nowrap"),
    parse,
    (position) => position
  )
);
