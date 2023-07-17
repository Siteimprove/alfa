import { Keyword, List, Percentage, Position } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

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

const parse = List.parseCommaSeparated(
  Position.Component.parseHorizontal(true)
);

/**
 * @internal
 */
export const initialItem: Computed.Item = Position.Side.of(
  Keyword.of("left"),
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
