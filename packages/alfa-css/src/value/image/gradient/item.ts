import { Parser } from "@siteimprove/alfa-parser";

import { Parser as CSSParser, Token } from "../../../syntax";

import { Hint } from "./hint";
import { Stop } from "./stop";

const { pair, map, option, oneOrMore, delimited, left, right } = Parser;

export type Item = Stop | Hint;

export namespace Item {
  export type JSON = Stop.JSON | Hint.JSON;

  /**
   * {@link https://drafts.csswg.org/css-images/#typedef-color-stop-list}
   */
  export const parseList: CSSParser<Array<Item>> = map(
    pair(
      Stop.parse,
      oneOrMore(
        right(
          delimited(option(Token.parseWhitespace), Token.parseComma),
          pair(
            option(
              left(
                Hint.parse,
                delimited(option(Token.parseWhitespace), Token.parseComma)
              )
            ),
            Stop.parse
          )
        )
      )
    ),
    ([first, rest]) => {
      const items: Array<Item> = [first];

      for (const [hint, stop] of rest) {
        items.push(...hint, stop);
      }

      return items;
    }
  );
}
