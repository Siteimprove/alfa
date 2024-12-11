import { Keyword, List } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Item =
    | Keyword<"alpha">
    | Keyword<"luminance">
    | Keyword<"match-source">;
}

type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse("alpha", "luminance", "match-source");

const parseList = List.parseCommaSeparated(parse);

/**
 * @internal
 */
export const initialItem = Keyword.of("match-source");

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-mode}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([initialItem], ", "),
  parseList,
  (value, style) => value.map(Resolver.layers(style, "mask-image")),
);
