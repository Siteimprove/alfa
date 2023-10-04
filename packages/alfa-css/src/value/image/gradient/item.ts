import { Parser } from "@siteimprove/alfa-parser";

import { Parser as CSSParser, Token } from "../../../syntax";

import { Hint } from "./hint";
import { Stop } from "./stop";

const { pair, map, option, delimited, left, right, separatedList } = Parser;

export type Item = Stop | Hint;

export namespace Item {
  export type JSON = Stop.JSON | Hint.JSON;

  const parseComma = delimited(option(Token.parseWhitespace), Token.parseComma);

  // <linear-color-hint>? , <linear-color-stop>
  const parse = pair(option(left(Hint.parse, parseComma)), Stop.parse);

  /**
   * {@link https://drafts.csswg.org/css-images/#typedef-color-stop-list}
   */
  export const parseList: CSSParser<Array<Item>> = map(
    pair(Stop.parse, right(parseComma, separatedList(parse, parseComma))),
    ([first, rest]) => {
      const items: Array<Item> = [first];

      for (const [hint, stop] of rest) {
        items.push(...hint, stop);
      }

      return items;
    }
  );
}
