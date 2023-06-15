import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax";

import { Angle, Length, Number, Percentage } from "../numeric";

import { Matrix } from "./matrix";
import { Perspective } from "./perspective";
import { Rotate } from "./rotate";
import { Scale } from "./scale";
import { Skew } from "./skew";
import { Translate } from "./translate";

const { either, oneOrMore, delimited, option } = Parser;

/**
 * @public
 */
export type Transform =
  | Matrix
  | Perspective
  | Rotate
  | Scale
  | Skew
  | Translate;

/**
 * @public
 */
export namespace Transform {
  export function matrix(...values: Matrix.Values<Number.Fixed>): Matrix {
    return Matrix.of(...values);
  }

  export function perspective<D extends Length.Fixed>(
    depth: D
  ): Perspective<D> {
    return Perspective.of(depth);
  }

  export function rotate<A extends Angle.Fixed>(
    x: Number.Fixed,
    y: Number.Fixed,
    z: Number.Fixed,
    angle: A
  ): Rotate<A> {
    return Rotate.of(x, y, z, angle);
  }

  export function scale(x: Number.Fixed, y: Number.Fixed): Scale {
    return Scale.of(x, y);
  }

  export function skew<X extends Angle.Fixed, Y extends Angle.Fixed>(
    x: X,
    y: Y
  ): Skew<X, Y> {
    return Skew.of(x, y);
  }

  export function translate<
    X extends Length.Fixed | Percentage.Fixed,
    Y extends Length.Fixed | Percentage.Fixed,
    Z extends Length.Fixed
  >(x: X, y: Y, z: Z): Translate<X, Y, Z> {
    return Translate.of(x, y, z);
  }

  /**
   * {@link https://drafts.csswg.org/css-transforms/#typedef-transform-function}
   */
  export const parse = either<Slice<Token>, Transform, string>(
    Matrix.parse,
    Perspective.parse,
    Rotate.parse,
    Scale.parse,
    Skew.parse,
    Translate.parse
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#typedef-transform-list}
   */
  export const parseList: Parser<
    Slice<Token>,
    Array<Transform>,
    string
  > = oneOrMore(delimited(option(Token.parseWhitespace), parse));
}
