import {
  Length,
  List,
  Percentage,
  Token,
  Position,
} from "@siteimprove/alfa-css";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

const { map, either, delimited, option, separatedList } = Parser;

/**
 * @internal
 */
export type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Item = Position.Component<Position.Horizontal>;
}

/**
 * @internal
 */
export type Computed = List<Computed.Item>;

/**
 * @internal
 */
export namespace Computed {
  export type Item = Position.Component<Position.Horizontal, "px">;
}

/**
 * @internal
 */
export const parse = either(
  Position.parseCenter,
  either(Length.parseBase, Percentage.parse)
);

/**
 * @internal
 */
export const parseList = map(
  separatedList(
    parse,
    delimited(option(Token.parseWhitespace), Token.parseComma)
  ),
  (positions) => List.of(positions, ", ")
);

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
  parseList,
  (value, style) =>
    value.map((positions) =>
      List.of(
        Iterable.map(positions, (position) =>
          Resolver.positionComponent(position, style)
        ),
        ", "
      )
    )
);
