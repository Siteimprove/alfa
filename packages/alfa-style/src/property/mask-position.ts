import { Keyword, List, Percentage, Position } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Item = Position.Component<Position.Keywords.Horizontal>;
}

type Computed = List<Computed.Item>;

namespace Computed {
  export type Item =
    Position.Component.PartiallyResolved<Position.Keywords.Horizontal>;
}

const parse = List.parseCommaSeparated(Position.Component.parseHorizontal);

/**
 * @internal
 */
export const initialItem: Computed.Item = Position.Side.of(
  Keyword.of("left"),
  Percentage.of(0),
);

// TODO: Copied from background-position-x.ts. Adjust for mask-position.
/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-position}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([initialItem]),
  parse,
  (value, style) =>
    value.map((positions) =>
      positions.map(
        Position.Component.partiallyResolve(Resolver.length(style)),
      ),
    ),
);
