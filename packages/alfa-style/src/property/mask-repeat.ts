import { Keyword, List } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

const { either } = Parser;

type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Item =
    | Keyword<"repeat-x">
    | Keyword<"repeat-y">
    | List<
        | Keyword<"repeat">
        | Keyword<"space">
        | Keyword<"round">
        | Keyword<"no-repeat">
      >;
}

type Computed = Specified;

/**
 * @internal
 */
export const parse = either(
  Keyword.parse("repeat-x", "repeat-y"),
  List.parseSpaceSeparated(
    Keyword.parse("repeat", "space", "round", "no-repeat"),
    1,
    2,
  ),
);

const parseList = List.parseCommaSeparated(parse);

/**
 * @internal
 */
export const initialItem = List.of([Keyword.of("repeat")], " ");

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-repeat}
 *
 * @privateRemarks
 * The spec says that the computed value "Consists of: two keywords, one per dimension",
 * which could be taken to mean that the one-keyword shorthand values should be expanded to their two-keyword longhands,
 * e.g. `repeat-x` would be expanded to `repeat no-repeat` in the computed style,
 * but that is not the current behavior observed in the DevTools of Chrome and Firefox.
 * We mimic the behavior of the browsers and do not expand the shorthands.
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([initialItem], ", "),
  parseList,
  (value, style) => value.map(Resolver.layers(style, "mask-image")),
);
