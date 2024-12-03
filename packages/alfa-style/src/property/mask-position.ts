import {
  Keyword,
  LengthPercentage,
  List,
  Position,
} from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";
import { matchLayers } from "./mask.js";

type Specified = List<Position>;
type Computed = Specified;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-position}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of(
    [
      Position.of(
        Position.Side.of(Keyword.of("left"), LengthPercentage.of(0)),
        Position.Side.of(Keyword.of("top"), LengthPercentage.of(0)),
      ),
    ],
    ", ",
  ),
  List.parseCommaSeparated(Position.parse(/* legacySyntax */ true)),
  (value, style) => value.map((positions) => matchLayers(positions, style)),
);
