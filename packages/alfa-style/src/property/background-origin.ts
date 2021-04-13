import { Box, Keyword, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

import { List } from "./value/list";

const { map, delimited, option, separatedList } = Parser;

declare module "../property" {
  interface Longhands {
    "background-origin": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Item = Box;
}

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Box.parse;

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
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-origin}
 * @internal
 */
export default Property.register(
  "background-origin",
  Property.of<Specified, Computed>(
    List.of([Keyword.of("border-box")], ", "),
    parseList,
    (value) => value
  )
);
