import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

import * as End from "./inset-inline-end";
import * as Start from "./inset-inline-start";

const { map, pair, option, right } = Parser;

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/inset-inline
 * @internal
 */
export default Property.shorthand(
  ["inset-inline-start", "inset-inline-end"],
  map(
    pair(Start.parse, option(right(option(Token.parseWhitespace), End.parse))),
    ([start, end]) => [
      ["inset-inline-start", start],
      ["inset-inline-end", end.getOr(start)],
    ]
  )
);
