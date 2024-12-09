import { Box, Keyword, List } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.js";

import { matchLayers } from "./helpers/mask-layers.js";

type Specified = List<Box.CoordBox>;
type Computed = Specified;

export namespace MaskOrigin {
  export const initialItem = Keyword.of("border-box");
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-origin}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([MaskOrigin.initialItem], ", "),
  List.parseCommaSeparated(Box.parseCoordBox),
  (value, style) => value.map((value) => matchLayers(value, style)),
);
