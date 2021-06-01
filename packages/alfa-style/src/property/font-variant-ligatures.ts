import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

declare module "../property" {
  interface Longhands {
    "font-variant-ligatures": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified =
  | Keyword<"none">
  | Keyword<"normal">
  | Keyword<"common-ligatures">
  | Keyword<"no-common-ligatures">
  | Keyword<"discretionary-ligatures">
  | Keyword<"no-discretionary-ligatures">
  | Keyword<"historical-ligatures">
  | Keyword<"no-historical-ligatures">
  | Keyword<"contextual">
  | Keyword<"no-contextual">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse(
  "none",
  "normal",
  "common-ligatures",
  "no-common-ligatures",
  "discretionary-ligatures",
  "no-discretionary-ligatures",
  "historical-ligatures",
  "no-historical-ligatures",
  "contextual",
  "no-contextual"
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-ligatures}
 * @internal
 */
export default Property.register(
  "font-variant-ligatures",
  Property.of<Specified, Computed>(
    Keyword.of("normal"),
    parse,
    (ligatures) => ligatures,
    { inherits: true }
  )
);
