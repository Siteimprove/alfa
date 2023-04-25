import { Token, Position } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../foo-prop-class";

import { List } from "./value/list";

import * as X from "./background-position-x";
import * as Y from "./background-position-y";

const { map, delimited, option, separatedList } = Parser;

declare module "../property" {
  interface Shorthands {
    "background-position": Property.Shorthand<
      "background-position-x" | "background-position-y"
    >;
  }
}

/**
 * @internal
 */
export const parse = Position.parse(/* legacySyntax */ true);

/**
 * @internal
 */
export const parseList = map(
  separatedList(
    parse,
    delimited(option(Token.parseWhitespace), Token.parseComma)
  ),
  (positions) => List.of(positions, ", ")
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-position}
 * @internal
 */
export default Property.registerShorthand(
  "background-position",
  Property.shorthand(
    ["background-position-x", "background-position-y"],
    map(parseList, (positions) => {
      const xs: Array<X.Specified.Item> = [];
      const ys: Array<Y.Specified.Item> = [];

      for (const position of positions) {
        xs.push(position.horizontal);
        ys.push(position.vertical);
      }

      return [
        ["background-position-x", List.of(xs, ", ")],
        ["background-position-y", List.of(ys, ", ")],
      ];
    })
);
