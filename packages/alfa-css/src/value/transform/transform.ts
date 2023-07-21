import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax";

import { List } from "../collection";
import { Angle, Length, LengthPercentage, Number } from "../numeric";
import { Resolvable } from "../resolvable";
import { Value } from "../value";

import { Matrix } from "./matrix";
import { Perspective } from "./perspective";
import { Rotate } from "./rotate";
import { Scale } from "./scale";
import { Skew } from "./skew";
import { Translate } from "./translate";

const { either } = Parser;

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
  export type Canonical =
    | Matrix.Canonical
    | Perspective.Canonical
    | Rotate.Canonical
    | Scale.Canonical
    | Skew.Canonical
    | Translate.Canonical;

  export type Resolver = LengthPercentage.Resolver;

  export function resolve(resolver: Resolver): (value: Transform) => Canonical {
    return (value) => value.resolve(resolver);
  }

  export type PartiallyResolved =
    | Matrix.Canonical
    | Perspective.Canonical
    | Rotate.Canonical
    | Scale.Canonical
    | Skew.Canonical
    | Translate.PartiallyResolved;

  export type PartialResolver = Translate.PartialResolver;

  export function partiallyResolve(
    resolver: PartialResolver
  ): (value: Transform) => PartiallyResolved {
    return (value) =>
      Translate.isTranslate(value)
        ? Translate.partiallyResolve(resolver)(value)
        : value.resolve(resolver);
  }

  export function matrix(...values: Matrix.Values<Number>): Matrix {
    return Matrix.of(...values);
  }

  export function perspective<D extends Length>(depth: D): Perspective<D> {
    return Perspective.of(depth);
  }

  export function rotate(
    x: Number,
    y: Number,
    z: Number,
    angle: Angle
  ): Rotate {
    return Rotate.of(x, y, z, angle);
  }

  export function scale(x: Number, y: Number): Scale {
    return Scale.of(x, y);
  }

  export function skew(x: Angle, y: Angle): Skew {
    return Skew.of(x, y);
  }

  export function translate<
    X extends LengthPercentage,
    Y extends LengthPercentage,
    Z extends Length
  >(x: X, y: Y, z: Z): Translate<X, Y, Z> {
    return Translate.of(x, y, z);
  }

  /**
   * {@link https://drafts.csswg.org/css-transforms/#typedef-transform-function}
   *
   * @internal
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
  export const parseList = List.parseSpaceSeparated(parse);
}
