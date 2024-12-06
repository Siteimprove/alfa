import {
  Keyword,
  LengthPercentage,
  List,
  Position,
} from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.js";
import { matchLayers } from "./mask.js";
import { Resolver } from "../resolver.js";

type Specified = List<Position>;
type Computed = List<Position.PartiallyResolved>;

export const initialItem = Position.of(
  Position.Side.of(Keyword.of("left"), LengthPercentage.of(0)),
  Position.Side.of(Keyword.of("top"), LengthPercentage.of(0)),
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-position}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([initialItem], ", "),
  List.parseCommaSeparated(Position.parse(/* legacySyntax */ true)),
  (value, style) =>
    value.map((positions) =>
      matchLayers(
        positions.map((position) =>
          position.partiallyResolve(Resolver.length(style)),
        ),
        style,
      ),
    ),
);
