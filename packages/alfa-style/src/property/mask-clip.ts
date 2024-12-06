import { Parser } from "@siteimprove/alfa-parser";
import { Box, Keyword, List } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.js";
import { matchLayers } from "./mask.js";

const { either } = Parser;

type Specified = List<Box.CoordBox | Keyword<"no-clip">>;
type Computed = Specified;

export const initialItem = Keyword.of("border-box");

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-clip}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([initialItem]),
  List.parseCommaSeparated(either(Box.parseCoordBox, Keyword.parse("no-clip"))),
  (value, style) => value.map((value) => matchLayers(value, style)),
);
