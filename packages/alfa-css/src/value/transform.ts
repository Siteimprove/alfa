import { Angle } from "./angle";
import { Length } from "./length";
import { Number } from "./number";
import { Percentage } from "./percentage";

import { Matrix } from "./transform/matrix";
import { Rotate } from "./transform/rotate";
import { Translate } from "./transform/translate";

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

  export function translate<
    X extends Length | Percentage,
    Y extends Length | Percentage,
    Z extends Length
  >(x: X, y: Y, z: Z): Translate<X, Y, Z> {
    return Translate.of(x, y, z);
  }
}
