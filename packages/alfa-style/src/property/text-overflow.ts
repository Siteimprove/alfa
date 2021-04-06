import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

declare module "../property" {
  interface Longhands {
    "text-overflow": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified = Keyword<"clip"> | Keyword<"ellipsis">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse("clip", "ellipsis");

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-overflow}
 * @internal
 */
export default Property.register(
  "text-overflow",
  Property.of<Specified, Computed>(
    Keyword.of("clip"),
    parse,
    (textOverflow) => textOverflow
  )
);
