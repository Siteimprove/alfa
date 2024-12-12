import {
  Keyword,
  LengthPercentage,
  List,
  Position,
} from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Item = Position;
}

type Computed = Specified;

/**
 * @internal
 */
export const parse = Position.parse(/* legacySyntax */ true);

const parseList = List.parseCommaSeparated(parse);

/**
 * @internal
 */
export const initialItem = Position.of(
  Position.Side.of(Keyword.of("left"), LengthPercentage.of(0)),
  Position.Side.of(Keyword.of("top"), LengthPercentage.of(0)),
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-position}
 *
 * @remarks
 * We do not currently fully follow the definition of computed value given in the specification.
 * Accordingly the computed value should consist of two keywords and two offsets.
 * E.g specifying a single keyword `right` would compute to `top 50% left 100%` or similar.
 * But in the current implementation keyword based values are not resolved into keywords with offsets.
 * So the single keyword `right` will just compute unaltered to `right`.
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([initialItem], ", "),
  parseList,
  (value, style) => {
    const layers = Resolver.layers(style, "mask-image");

    return value.map((positions) =>
      layers(
        positions.map((position) =>
          position.partiallyResolve(Resolver.length(style)),
        ),
      ),
    );
  },
);
