import { Parser } from "@siteimprove/alfa-parser";
import { Box, Keyword, List } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

const { either } = Parser;

type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Item = Box.CoordBox | Keyword<"no-clip">;
}

type Computed = Specified;

/**
 * @internal
 */
export const parse = either(Box.parseCoordBox, Keyword.parse("no-clip"));

const parseList = List.parseCommaSeparated(parse);

/**
 * @internal
 */
export const initialItem = Keyword.of("border-box");

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-clip}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([initialItem]),
  parseList,
  (value, style) => value.map(Resolver.layers(style, "mask-image")),
);
