import { List, Percentage, Position } from "@siteimprove/alfa-css";

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
  export type Item = Position.Component<Position.Keywords.Horizontal, "px">;
}

const parse = List.parseCommaSeparated(Position.Component.parseHorizontal);

/**
 * @internal
 */
export const initialItem = Percentage.of(0);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-position}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([initialItem]),
  parse,
  (value, style) =>
    value.map((positions) =>
      positions.map((position) => Resolver.positionComponent(position, style))
    )
);
