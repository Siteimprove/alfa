import { Parser } from "@siteimprove/alfa-parser";
import { Box, Keyword, List } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.js";

const { either } = Parser;

type Specified = List<Box.CoordBox | Keyword<"no-clip">>;
type Computed = Specified;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-clip}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([Keyword.of("border-box")]),
  List.parseCommaSeparated(either(Box.parseCoordBox, Keyword.parse("no-clip"))),
  (value) => value,
);
