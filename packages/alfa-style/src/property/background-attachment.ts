import { Keyword, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

import { List } from "./value/list";

const { map, delimited, option, separatedList } = Parser;

/**
 * @internal
 */
export type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Item = Keyword<"fixed"> | Keyword<"local"> | Keyword<"scroll">;
}

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse("fixed", "local", "scroll");

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
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-attachment
 * @internal
 */
export default Property.of<Specified, Computed>(
  List.of([Keyword.of("scroll")], ", "),
  parseList,
  (value) => value
);
