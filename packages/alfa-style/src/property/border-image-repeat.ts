import { Keyword } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Property } from "../property";

const { takeBetween, either, map } = Parser;

/**
 * @internal
 */

export type Specified =
  | Keyword<"stretch">
  | Keyword<"repeat">
  | Keyword<"round">
  | Keyword<"space">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = map(
  takeBetween(Keyword.parse("stretch", "repeat", "round", "space"), 1, 2),
  // TODO
  ([horizontal, vertical = horizontal]) => [horizontal, vertical] as const
);

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-repeat
 * @internal
 */
export default Property.of<Specified, Computed>(
  Keyword.of("stretch"),
  parse,
  (borderImageRepeat) => borderImageRepeat
);
