import { List, Position } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Shorthand } from "../shorthand.js";

import * as X from "./background-position-x.js";
import * as Y from "./background-position-y.js";

const { map } = Parser;

/**
 * @internal
 */
export const parse = Position.parse(/* legacySyntax */ true);

const parseList = List.parseCommaSeparated(parse);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-position}
 * @internal
 */
export default Shorthand.of(
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
  }),
);
