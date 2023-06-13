import { Keyword, List, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Shorthand } from "../shorthand";

import * as X from "./background-repeat-x";
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

const { map, either, delimited, option, pair, separatedList } = Parser;

/**
 * @internal
 */
export const parse = either(
  map(
    pair(X.parse, option(delimited(option(Token.parseWhitespace), Y.parse))),
    ([x, y]) => [x, y.getOr(x)] as const
  ),
  either(
    map(
      Keyword.parse("repeat-x"),
      () => [Keyword.of("repeat"), Keyword.of("no-repeat")] as const
    ),
    map(
      Keyword.parse("repeat-y"),
      () => [Keyword.of("no-repeat"), Keyword.of("repeat")] as const
    )
  )
);

/**
 * @internal
 */
export const parseList = List.parseCommaSeparated(parse);

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
      const [x, y] = repeat;

      xs.push(x);
      ys.push(y);
    }

    return [
      ["background-repeat-x", List.of(xs, ", ")],
      ["background-repeat-y", List.of(ys, ", ")],
    ];
  })
);
