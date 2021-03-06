import { Length, Percentage, Token, Position } from "@siteimprove/alfa-css";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

import { List } from "./value/list";

const { map, either, delimited, option, separatedList } = Parser;

declare module "../property" {
  interface Longhands {
    "background-position-x": Property<Specified, Computed>;
  }
}

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
  either(Length.parse, Percentage.parse)
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
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-position}
 * @internal
 */
export default Property.register(
  "background-position-x",
  Property.of<Specified, Computed>(
    List.of([Length.of(0, "px")]),
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
  )
);
