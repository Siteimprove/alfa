import { Keyword, List, Percentage, Position } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Item = Position.Component<Position.Keywords.Vertical>;
}

type Computed = List<Computed.Item>;

namespace Computed {
  export type Item =
    Position.Component.PartiallyResolved<Position.Keywords.Vertical>;
}

const parse = List.parseCommaSeparated(Position.Component.parseVertical);

/**
 * @internal
 */
export const initialItem: Computed.Item = Position.Side.of(
  Keyword.of("top"),
  Percentage.of(0)
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-position}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([initialItem]),
  parse,
  (value, style) =>
    value.map((positions) =>
      positions.map(Position.Component.partiallyResolve(Resolver.length(style)))
    )
);
