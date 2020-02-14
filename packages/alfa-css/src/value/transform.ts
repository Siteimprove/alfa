import { Parser } from "@siteimprove/alfa-parser";

import { Token } from "../syntax/token";

import { Angle } from "./angle";
import { Length } from "./length";
import { List } from "./list";
import { Number } from "./number";
import { Percentage } from "./percentage";

import { Matrix } from "./transform/matrix";
import { Rotate } from "./transform/rotate";
import { Skew } from "./transform/skew";
import { Translate } from "./transform/translate";

const { either, oneOrMore, delimited, option, map } = Parser;

export namespace Transform {
  export function matrix(...values: Matrix.Values<Number>): Matrix {
    return Matrix.of(...values);
  }

  export function rotate<A extends Angle>(
    x: Number,
    y: Number,
    z: Number,
    angle: A
  ): Rotate<A> {
    return Rotate.of(x, y, z, angle);
  }

  export function skew<X extends Angle, Y extends Angle>(
    x: X,
    y: Y
  ): Skew<X, Y> {
    return Skew.of(x, y);
  }

  export function translate<
    X extends Length | Percentage,
    Y extends Length | Percentage,
    Z extends Length
  >(x: X, y: Y, z: Z): Translate<X, Y, Z> {
    return Translate.of(x, y, z);
  }

  /**
   * @see https://drafts.csswg.org/css-transforms/#typedef-transform-list
   */
  export const parseList = map(
    oneOrMore(
      delimited(
        option(Token.parseWhitespace),
        either(
          Matrix.parse,
          either(Rotate.parse, either(Skew.parse, Translate.parse))
        )
      )
    ),
    transforms => List.of([...transforms], " ")
  );
}
