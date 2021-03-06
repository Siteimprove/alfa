import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

declare module "../property" {
  interface Longhands {
    "white-space": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified =
  | Keyword<"normal">
  | Keyword<"pre">
  | Keyword<"nowrap">
  | Keyword<"pre-wrap">
  | Keyword<"break-spaces">
  | Keyword<"pre-line">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse(
  "normal",
  "pre",
  "nowrap",
  "pre-wrap",
  "break-spaces",
  "pre-line"
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/white-space}
 * @internal
 */
export default Property.register(
  "white-space",
  Property.of<Specified, Computed>(
    Keyword.of("normal"),
    parse,
    (whiteSpace) => whiteSpace,
    {
      inherits: true,
    }
  )
);
