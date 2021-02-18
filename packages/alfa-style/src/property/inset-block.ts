import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

import * as End from "./inset-block-end";
import * as Start from "./inset-block-start";

const { map, pair, option, right } = Parser;

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/inset-block
 * @internal
 */
export default Property.shorthand(
  ["inset-block-start", "inset-block-end"],
  map(
    pair(Start.parse, option(right(option(Token.parseWhitespace), End.parse))),
    ([start, end]) => [
      ["inset-block-start", start],
      ["inset-block-end", end.getOr(start)],
    ]
  )
);
