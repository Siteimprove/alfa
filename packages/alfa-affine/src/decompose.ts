import { Matrix, Vector } from "@siteimprove/alfa-math";
import { Transformation } from "./transformation";

const { sqrt, max } = Math;

export interface Decomposed {
  /**
   * A vector representing [x, y, z] translation.
   */
  readonly translate: Vector<3>;

  /**
   * A vector representing [x, y, z] scaling.
   */
  readonly scale: Vector<3>;

  /**
   * A vector representing [xy, xz, yz] skewing.
   */
  readonly skew: Vector<3>;

  /**
   * A quaternion representing [x, y, z, w] rotation.
   */
  readonly rotate: Vector<4>;

  /**
   * A quaternion representing [x, y, z, w] perspective.
   */
  readonly perspective: Vector<4>;
}

/**
 * @see https://drafts.csswg.org/css-transforms-2/#decomposing-a-3d-matrix
 */
export function decompose(transformation: Transformation): Decomposed | null {
  if (transformation[3][3] === 0) {
    return null;
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
    return null;
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

  return { translate, scale, skew, rotate, perspective };
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
