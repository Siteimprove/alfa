import { Matrix, Vector } from "@siteimprove/alfa-math";
import { None, Option } from "@siteimprove/alfa-option";

const { cos, sin, tan, sqrt, max } = Math;

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

  export interface Decomposed {
    /**
     * A vector representing [x, y, z] translation.
     */
    translate: Vector<3>;

    /**
     * A vector representing [x, y, z] scaling.
     */
    scale: Vector<3>;

    /**
     * A vector representing [xy, xz, yz] skewing.
     */
    skew: Vector<3>;

    /**
     * A quaternion representing [x, y, z, w] rotation.
     */
    rotate: Vector<4>;

    /**
     * A quaternion representing [x, y, z, w] perspective.
     */
    perspective: Vector<4>;
  }

  /**
   * @see https://drafts.csswg.org/css-transforms-2/#decomposing-a-3d-matrix
   */
  export function decompose(
    transformation: Transformation
  ): Option<Decomposed> {
    if (transformation[3][3] === 0) {
      return None;
    }

    const t = Matrix.clone(transformation);

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        t[i][j] /= t[3][3];
      }
    }

    let perspective: Matrix<4, 4> | Vector<4> = Matrix.clone(t);

    for (let i = 0; i < 3; i++) {
      perspective[3][i] = 0;
    }

    perspective[3][3] = 1;

    if (Matrix.determinant(perspective) === 0) {
      return None;
    }

    if (t[3][0] !== 0 || t[3][1] !== 0 || t[3][2] !== 0) {
      perspective = Matrix.multiply(
        Matrix.transpose(Matrix.inverse(perspective)),
        transformation[3]
      );
    } else {
      perspective = [0, 0, 0, 1];
    }

    const translate: Vector<3> = [t[0][3], t[1][3], t[2][3]];

    const u: Matrix<3, 3> = [
      [t[0][0], t[0][1], t[0][2]],
      [t[1][0], t[1][1], t[1][2]],
      [t[2][0], t[2][1], t[2][2]]
    ];

    const scale: Vector<3> = [Vector.norm(u[0]), 0, 0];

    u[0] = Vector.normalize(u[0]);

    const skew: Vector<3> = [Vector.multiply(u[0], u[1]), 0, 0];

    u[1] = combine(u[1], u[0], 1, -skew[0]);

    scale[1] = Vector.norm(u[1]);
    u[1] = Vector.normalize(u[1]);
    skew[0] /= scale[1];

    skew[1] = Vector.multiply(u[0], u[2]);
    u[2] = combine(u[2], u[0], 1.0, -skew[1]);
    skew[2] = Vector.multiply(u[1], u[2]);
    u[2] = combine(u[2], u[1], 1.0, -skew[2]);

    scale[2] = Vector.norm(u[2]);
    u[2] = Vector.normalize(u[2]);
    skew[1] /= scale[2];
    skew[2] /= scale[2];

    if (Vector.multiply(u[0], Vector.cross(u[1], u[2])) < 0) {
      for (let i = 0; i < 3; i++) {
        scale[i] *= -1;
        u[i][0] *= -1;
        u[i][1] *= -1;
        u[i][2] *= -1;
      }
    }

    const rotate: Vector<4> = [
      0.5 * sqrt(max(1 + u[0][0] - u[1][1] - u[2][2], 0)),
      0.5 * sqrt(max(1 - u[0][0] + u[1][1] - u[2][2], 0)),
      0.5 * sqrt(max(1 - u[0][0] - u[1][1] + u[2][2], 0)),
      0.5 * sqrt(max(1 + u[0][0] + u[1][1] + u[2][2], 0))
    ];

    if (u[2][1] > u[1][2]) {
      rotate[0] = -rotate[0];
    }

    if (u[0][2] > u[2][0]) {
      rotate[1] = -rotate[1];
    }

    if (u[1][0] > u[0][1]) {
      rotate[2] = -rotate[2];
    }

    return Option.of({ translate, scale, skew, rotate, perspective });
  }

  function combine(
    a: Vector<3>,
    b: Vector<3>,
    ascl: number,
    bscl: number
  ): Vector<3> {
    return [
      ascl * a[0] + bscl * b[0],
      ascl * a[1] + bscl * b[1],
      ascl * a[2] + bscl * b[2]
    ];
  }
}
