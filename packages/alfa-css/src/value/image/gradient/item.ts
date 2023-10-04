import { Parser } from "@siteimprove/alfa-parser";

import { Comma, Parser as CSSParser } from "../../../syntax";

import { Hint } from "./hint";
import { Stop } from "./stop";

const { pair, map, option, left, right, separatedList } = Parser;

export type Item = Stop | Hint;

export namespace Item {
  export type JSON = Stop.JSON | Hint.JSON;

  // <linear-color-hint>? , <linear-color-stop>
  const parse = pair(option(left(Hint.parse, Comma.parse)), Stop.parse);

  /**
   * {@link https://drafts.csswg.org/css-images/#typedef-color-stop-list}
   */
  export const parseList: CSSParser<Array<Item>> = map(
    pair(Stop.parse, right(Comma.parse, separatedList(parse, Comma.parse))),
    ([first, rest]) => {
      const items: Array<Item> = [first];

      for (const [hint, stop] of rest) {
        items.push(...hint, stop);
      }

      return items;
    }
  );
}
