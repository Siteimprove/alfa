import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Matrix, Vector } from "@siteimprove/alfa-math";
import { None, Option } from "@siteimprove/alfa-option";

const { cos, sin, tan, sqrt, max } = Math;
const { norm, normalize, dot, cross } = Vector;
const { determinant, multiply, inverse, transpose } = Matrix;

export class Transformation implements Equatable, Serializable {
  public static of(matrix: Matrix): Transformation {
    const [
      [a = 1, b = 0, c = 0, d = 0] = [],
      [e = 0, f = 1, g = 0, h = 0] = [],
      [i = 0, j = 0, k = 1, l = 0] = [],
      [m = 0, n = 0, o = 0, p = 1] = [],
    ] = matrix;

    return new Transformation([
      [a, b, c, d],
      [e, f, g, h],
      [i, j, k, l],
      [m, n, o, p],
    ]);
  }

  private static _empty = new Transformation(Matrix.identity(4));

  public static empty(): Transformation {
    return this._empty;
  }

  private readonly _matrix: Matrix;

  private constructor(matrix: Matrix) {
    this._matrix = matrix;
  }

  public apply(transformation: Transformation): Transformation {
    return new Transformation(multiply(this._matrix, transformation._matrix));
  }

  public translate(tx: number, ty: number = 0, tz: number = 0): Transformation {
    return this.apply(Transformation.translate(tx, ty, tz));
  }

  public scale(sx: number, sy: number = sx, sz: number = 1): Transformation {
    return this.apply(Transformation.scale(sx, sy, sz));
  }

  public skew(a: number, b: number): Transformation {
    return this.apply(Transformation.skew(a, b));
  }

  public rotate(a: number, u?: [number, number, number]): Transformation {
    return this.apply(Transformation.rotate(a, u));
  }

  public perspective(d: number): Transformation {
    return this.apply(Transformation.perspective(d));
  }

  /**
   * @see https://drafts.csswg.org/css-transforms-2/#decomposing-a-3d-matrix
   */
  public decompose(): Option<Transformation.Components> {
    const m = this._matrix;

    if (m[3][3] === 0) {
      return None;
    }

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        m[i][j] /= m[3][3];
      }
    }

    // Perspective
    let p: Matrix | Vector = Matrix.clone(m);

    for (let i = 0; i < 3; i++) {
      p[3][i] = 0;
    }

    p[3][3] = 1;

    if (determinant(p) === 0) {
      return None;
    }

    if (m[3][0] !== 0 || m[3][1] !== 0 || m[3][2] !== 0) {
      p = multiply(
        transpose(inverse(p)),
        m[3].map((v) => [v])
      ).map(([v]) => v);
    } else {
      p = [0, 0, 0, 1];
    }

    // Translate
    const t = [m[0][3], m[1][3], m[2][3]];

    const u = [
      [m[0][0], m[0][1], m[0][2]],
      [m[1][0], m[1][1], m[1][2]],
      [m[2][0], m[2][1], m[2][2]],
    ];

    // Scale
    const s = [norm(u[0]), 0, 0];

    u[0] = normalize(u[0]);

    // Skew
    const z = [dot(u[0], u[1]), 0, 0];

    u[1] = combine(u[1], u[0], 1, -z[0]);

    s[1] = norm(u[1]);
    u[1] = normalize(u[1]);
    z[0] /= s[1];

    z[1] = dot(u[0], u[2]);
    u[2] = combine(u[2], u[0], 1.0, -z[1]);
    z[2] = dot(u[1], u[2]);
    u[2] = combine(u[2], u[1], 1.0, -z[2]);

    s[2] = norm(u[2]);
    u[2] = normalize(u[2]);
    z[1] /= s[2];
    z[2] /= s[2];

    if (dot(u[0], cross(u[1], u[2])) < 0) {
      for (let i = 0; i < 3; i++) {
        s[i] *= -1;
        u[i][0] *= -1;
        u[i][1] *= -1;
        u[i][2] *= -1;
      }
    }

    // Rotate
    const r = [
      0.5 * sqrt(max(1 + u[0][0] - u[1][1] - u[2][2], 0)),
      0.5 * sqrt(max(1 - u[0][0] + u[1][1] - u[2][2], 0)),
      0.5 * sqrt(max(1 - u[0][0] - u[1][1] + u[2][2], 0)),
      0.5 * sqrt(max(1 + u[0][0] + u[1][1] + u[2][2], 0)),
    ];

    if (u[2][1] > u[1][2]) {
      r[0] = -r[0];
    }

    if (u[0][2] > u[2][0]) {
      r[1] = -r[1];
    }

    if (u[1][0] > u[0][1]) {
      r[2] = -r[2];
    }

    return Option.of({
      translate: t,
      scale: s,
      skew: z,
      rotate: r,
      perspective: p,
    });
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Transformation &&
      Matrix.equals(value._matrix, this._matrix)
    );
  }

  public toArray(): Array<Array<number>> {
    return Matrix.clone(this._matrix);
  }

  public toJSON(): Transformation.JSON {
    return Matrix.clone(this._matrix);
  }
}

export namespace Transformation {
  export type JSON = Array<Array<number>>;

  export interface Components {
    /**
     * A vector representing [x, y, z] translation.
     */
    translate: Vector;

    /**
     * A vector representing [x, y, z] scaling.
     */
    scale: Vector;

    /**
     * A vector representing [xy, xz, yz] skewing.
     */
    skew: Vector;

    /**
     * A quaternion representing [x, y, z, w] rotation.
     */
    rotate: Vector;

    /**
     * A quaternion representing [x, y, z, w] perspective.
     */
    perspective: Vector;
  }

  export function translate(
    tx: number,
    ty: number = 0,
    tz: number = 0
  ): Transformation {
    return Transformation.of([
      [1, 0, 0, tx],
      [0, 1, 0, ty],
      [0, 0, 1, tz],
      [0, 0, 0, 1],
    ]);
  }

  export function scale(
    sx: number,
    sy: number = sx,
    sz: number = 1
  ): Transformation {
    return Transformation.of([
      [sx, 0, 0],
      [0, sy, 0],
      [0, 0, sz],
    ]);
  }

  export function skew(a: number, b: number): Transformation {
    return Transformation.of([
      [1, tan(a)],
      [tan(b), 1],
    ]);
  }

  export function rotate(
    a: number,
    u: [number, number, number] = [0, 0, 1]
  ): Transformation {
    const [x, y, z] = normalize(u);

    return Transformation.of([
      [
        cos(a) + x ** 2 * (1 - cos(a)),
        x * y * (1 - cos(a)) - z * sin(a),
        x * z * (1 - cos(a)) + y * sin(a),
      ],
      [
        y * x * (1 - cos(a)) + z * sin(a),
        cos(a) + y ** 2 * (1 - cos(a)),
        y * z * (1 - cos(a)) - x * sin(a),
      ],
      [
        z * x * (1 - cos(a)) - y * sin(a),
        z * y * (1 - cos(a)) + x * sin(a),
        cos(a) + z ** 2 * (1 - cos(a)),
      ],
    ]);
  }

  export function perspective(d: number): Transformation {
    return Transformation.of([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, -1 / d, 1],
    ]);
  }
}

function combine(a: Vector, b: Vector, ascl: number, bscl: number): Vector {
  return [
    ascl * a[0] + bscl * b[0],
    ascl * a[1] + bscl * b[1],
    ascl * a[2] + bscl * b[2],
  ];
}
