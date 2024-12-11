import { Keyword, List } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Item =
    | Keyword<"add">
    | Keyword<"subtract">
    | Keyword<"intersect">
    | Keyword<"exclude">;
}

type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse("add", "subtract", "intersect", "exclude");

const parseList = List.parseCommaSeparated(parse);

/**
 * @internal
 */
export const initialItem = Keyword.of("add");

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-composite}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([initialItem], ", "),
  parseList,
  (value, style) => value.map(Resolver.layers(style, "mask-image")),
);
