import { Keyword, List, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";

const { map, delimited, option, separatedList } = Parser;

/**
 * @internal
 */
export type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Item =
    | Keyword<"repeat">
    | Keyword<"space">
    | Keyword<"round">
    | Keyword<"no-repeat">;
}

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse("repeat", "space", "round", "no-repeat");

/**
 * @internal
 */
export const parseList = map(
  separatedList(
    parse,
    delimited(option(Token.parseWhitespace), Token.parseComma)
  ),
  (repeats) => List.of(repeats, ", ")
);

/**
 * @internal
 */
export const initialItem = Keyword.of("repeat");

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-repeat}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([initialItem]),
  parseList,
  (value) => value
);
