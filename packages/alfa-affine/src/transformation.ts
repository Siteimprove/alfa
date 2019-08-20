import { Matrix } from "@siteimprove/alfa-math";

const { cos, sin, tan } = Math;

export type Transformation = Matrix<4, 4>;

export namespace Transformation {
  export function multiply(
    a: Transformation,
    b: Transformation
  ): Transformation {
    return Matrix.multiply(a, b);
  }

  export function identity(): Transformation {
    return Matrix.identity(4, 4);
  }

  export function translate(tx: number, ty = 0, tz = 0): Transformation {
    return [[1, 0, 0, tx], [0, 1, 0, ty], [0, 0, 1, tz], [0, 0, 0, 1]];
  }

  export function scale(sx: number, sy: number, sz = 1): Transformation {
    return [[sx, 0, 0, 0], [0, sy, 0, 0], [0, 0, sx, 0], [0, 0, 0, 1]];
  }

  export function rotate(a: number, x = 0, y = 0, z = 1): Transformation {
    const sc = sin(a / 2) * cos(a / 2);
    const sq = sin(a / 2) ** 2;

    return [
      [
        1 - 2 * (y ** 2 + z ** 2) * sq,
        2 * (x * y * sq - z * sc),
        2 * (x * z * sq + y * sc),
        0
      ],
      [
        2 * (x * y * sq + z * sc),
        1 - 2 * (x ** 2 + z ** 2) * sq,
        2 * (y * z * sq - x * sc),
        0
      ],
      [
        2 * (x * z * sq - y * sc),
        2 * (y * z * sq + x * sc),
        1 - 2 * (x ** 2 + y ** 2) * sq,
        0
      ],
      [0, 0, 0, 1]
    ];
  }

  export function skew(a: number, b: number): Transformation {
    return [[1, tan(a), 0, 0], [tan(b), 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
  }

  export function project(d: number): Transformation {
    return [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, -1 / d, 1]];
  }
}
