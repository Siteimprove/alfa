import { Keyword, List, Token, Tuple } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";

import { Shorthand } from "../shorthand.js";

import * as X from "./background-repeat-x.js";
/**
 * background-repeat-x and background-repeat-y are identical.
 * We mimic the needed bits here to avoid confusion in the main parser.
 */
namespace Y {
  export const parse = X.parse;

  export namespace Specified {
    export type Item = X.Specified.Item;
  }
}

const { map, either, delimited, option, pair } = Parser;

/**
 * @internal
 */
export const parse = either<
  Slice<Token>,
  Tuple<[X.Specified.Item, Y.Specified.Item]>,
  string
>(
  map(
    pair(X.parse, option(delimited(option(Token.parseWhitespace), Y.parse))),
    ([x, y]) => Tuple.of(x, y.getOr(x)),
  ),
  map(Keyword.parse("repeat-x"), () =>
    Tuple.of(Keyword.of("repeat"), Keyword.of("no-repeat")),
  ),
  map(Keyword.parse("repeat-y"), () =>
    Tuple.of(Keyword.of("no-repeat"), Keyword.of("repeat")),
  ),
);

const parseList = List.parseCommaSeparated(parse);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-repeat}
 * @internal
 */
export default Shorthand.of(
  ["background-repeat-x", "background-repeat-y"],
  map(parseList, (repeats) => {
    const xs: Array<X.Specified.Item> = [];
    const ys: Array<Y.Specified.Item> = [];

    for (const repeat of repeats) {
      const [x, y] = repeat.values;

      xs.push(x);
      ys.push(y);
    }

    return [
      ["background-repeat-x", List.of(xs, ", ")],
      ["background-repeat-y", List.of(ys, ", ")],
    ];
  }),
);
