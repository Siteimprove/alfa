import { Matrix, Vector } from "@siteimprove/alfa-math";

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
    return [[sx, 0, 0, 0], [0, sy, 0, 0], [0, 0, sz, 0], [0, 0, 0, 1]];
  }

  export function rotate(a: number, u: Vector<3> = [0, 0, 1]): Transformation {
    const [x, y, z] = Vector.normalize(u);

    return [
      [
        cos(a) + x ** 2 * (1 - cos(a)),
        x * y * (1 - cos(a)) - z * sin(a),
        x * z * (1 - cos(a)) + y * sin(a),
        0
      ],
      [
        y * x * (1 - cos(a)) + z * sin(a),
        cos(a) + y ** 2 * (1 - cos(a)),
        y * z * (1 - cos(a)) - x * sin(a),
        0
      ],
      [
        z * x * (1 - cos(a)) - y * sin(a),
        z * y * (1 - cos(a)) + x * sin(a),
        cos(a) + z ** 2 * (1 - cos(a)),
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
