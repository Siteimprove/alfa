import { Parser } from "@siteimprove/alfa-parser";

import { Comma, type Parser as CSSParser } from "../../../../syntax/index.js";

import { Hint } from "./hint.js";
import { Stop } from "./stop.js";

const { pair, map, option, left, right, separatedList } = Parser;

export type Item = Hint | Stop;

export namespace Item {
  export type JSON = Hint.JSON | Stop.JSON;

  export type Canonical = Hint.Canonical | Stop.Canonical;

  export type PartiallyResolved =
    | Hint.PartiallyResolved
    | Stop.PartiallyResolved;

  export type Resolver = Hint.Resolver & Stop.Resolver;

  export function resolve(resolver: Resolver): (value: Item) => Canonical {
    return (value) => value.resolve(resolver);
  }

  export type PartialResolver = Hint.PartialResolver & Stop.PartialResolver;

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
    },
  );
}
