import { Parser } from "@siteimprove/alfa-parser";
import { Box, Keyword, List } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

const { either } = Parser;

type Specified = List<Box.CoordBox | Keyword<"no-clip">>;
type Computed = Specified;

export namespace MaskClip {
  export const initialItem = Keyword.of("border-box");
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-clip}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([MaskClip.initialItem]),
  List.parseCommaSeparated(either(Box.parseCoordBox, Keyword.parse("no-clip"))),
  (value, style) => value.map(Resolver.layers(style, "mask-image")),
);
