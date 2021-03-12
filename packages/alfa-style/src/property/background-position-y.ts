import { Length, Percentage, Token, Position } from "@siteimprove/alfa-css";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

import { List } from "./value/list";

const { map, either, delimited, option, separatedList } = Parser;

/**
 * @internal
 */
export type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Item = Position.Component<Position.Vertical>;
}

/**
 * @internal
 */
export type Computed = List<Computed.Item>;

/**
 * @internal
 */
export namespace Computed {
  export type Item = Position.Component<Position.Vertical, "px">;
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
export default Property.of<Specified, Computed>(
  List.of([Length.of(0, "px")]),
  parseList,
  (value, style) =>
    value.map((positions) =>
      List.of(
        Iterable.map(positions, (position) => {
          switch (position.type) {
            case "keyword":
            case "percentage":
              return position;

            case "length":
              return Resolver.length(position, style);

            case "side":
              return Position.Side.of(
                position.side,
                position.offset.map((offset) => {
                  switch (offset.type) {
                    case "percentage":
                      return offset;

                    case "length":
                      return Resolver.length(offset, style);
                  }
                })
              );
          }
        }),
        ", "
      )
    )
);
