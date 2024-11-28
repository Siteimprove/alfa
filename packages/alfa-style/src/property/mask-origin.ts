import { Box, Keyword, List } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.js";

type Specified = List<Box.CoordBox>;
type Computed = Specified;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-origin}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([Keyword.of("border-box")]),
  List.parseCommaSeparated(Box.parseCoordBox),
  (value) => value,
);
