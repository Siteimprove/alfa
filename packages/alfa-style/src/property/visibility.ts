import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

declare module "../property" {
  interface Longhands {
    visibility: Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified =
  | Keyword<"visible">
  | Keyword<"hidden">
  | Keyword<"collapse">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse("visible", "hidden", "collapse");

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/visibility}
 * @internal
 */
export default Property.register(
  "visibility",
  Property.of<Specified, Computed>(
    Keyword.of("visible"),
    parse,
    (visibility) => visibility,
    {
      inherits: true,
    }
  )
);
