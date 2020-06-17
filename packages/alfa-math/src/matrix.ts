import { Real } from "./real";

/**
 * @see https://en.wikipedia.org/wiki/Matrix_(mathematics)
 */
export type Matrix = Array<Array<number>>;

export namespace Matrix {
  export function isMatrix(value: unknown): value is Matrix {
    return (
      Array.isArray(value) &&
      value.every(
        (r) => Array.isArray(r) && r.every((v) => typeof v === "number")
      )
    );
  }

  export function isSquare(m: Matrix): boolean {
    return rows(m) === columns(m);
  }

  export function clone(m: Matrix): Matrix {
    return m.map((r) => r.slice(0));
  }

  export function equals(m: Matrix, n: Matrix, e?: number): boolean {
    return (
      m.length === n.length &&
      m.every(
        (r, i) =>
          r.length === n[i].length &&
          r.every((v, j) => Real.equals(v, n[i][j], e))
      )
    );
  }

  export function identity(n: number): Matrix {
    return new Array<Array<number>>(n).fill([]).map((_, i) => {
      const r = new Array<number>(n).fill(0);
      r[i] = 1;
      return r;
    });
  }

  export function size(m: Matrix): [number, number] {
    return [rows(m), columns(m)];
  }

  export function rows(m: Matrix): number {
    return m.length;
  }

  export function columns(m: Matrix): number {
    return m.length === 0 ? 0 : m[0].length;
  }

  export function row(m: Matrix, i: number): Array<number> {
    return m[i];
  }

  export function column(m: Matrix, i: number): Array<number> {
    return m.map((r) => r[i]);
  }

  export function add(m: Matrix, n: Matrix): Matrix {
    return m.map((r, i) => r.map((v, j) => v + n?.[i]?.[j]));
  }

  export function subtract(m: Matrix, n: Matrix): Matrix {
    return m.map((r, i) => r.map((v, j) => v - n?.[i]?.[j]));
  }

  /**
   * @see https://en.wikipedia.org/wiki/Matrix_multiplication
   */
  export function multiply(m: Matrix, n: number | Matrix): Matrix {
    return typeof n === "number"
      ? m.map((r) => r.map((v) => v * n))
      : m.map((r, i) =>
          n[0].map((_, j) =>
            r.reduce((s, _, k) => s + m[i][k] * n?.[k]?.[j], 0)
          )
        );
  }

  /**
   * Compute the transpose of a matrix.
   *
   * @see https://en.wikipedia.org/wiki/Transpose
   */
  export function transpose(m: Matrix): Matrix {
    return m.length === 0 ? m : m[0].map((_, i) => m.map((row) => row[i]));
  }

  /**
   * Compute the determinant of a non-empty, square matrix.
   *
   * @see https://en.wikipedia.org/wiki/Determinant
   * @see https://en.wikipedia.org/wiki/Laplace_expansion
   *
   * @remarks
   * This function uses Laplace expansion for computing the determinant which
   * has a time complexity of O(n!) and is therefore not practical for large
   * matrices.
   */
  export function determinant(m: Matrix): number {
    switch (m.length) {
      // The determinant of a 1x1 matrix is the single value of the matrix.
      case 1:
        return m[0][0];

      // The determinant of a 2x2 matrix is fairly short to write out and so
      // this is done as an optimization.
      case 2:
        return m[0]?.[0] * m[1]?.[1] - m[0]?.[1] * m[1]?.[0];

      default:
        return m.reduce((d, _, i) => d + m[0]?.[i] * cofactor(m, 0, i), 0);
    }
  }

  /**
   * Compute the inverse of an invertible matrix.
   *
   * @see https://en.wikipedia.org/wiki/Invertible_matrix
   * @see https://en.wikipedia.org/wiki/Cramers_rule
   *
   * @remarks
   * This function uses Cramer's rule for computing the determinant which
   * has a time complexity of O(n!) and is therefore not practical for large
   * matrices.
   */
  export function inverse(m: Matrix): Matrix {
    return multiply(adjugate(m), 1 / determinant(m));
  }

  /**
   * Compute the (i, j) cofactor of a non-empty, square matrix.
   *
   * @see https://en.wikipedia.org/wiki/Minor_(linear_algebra)
   * @internal
   */
  function cofactor(m: Matrix, i: number, j: number): number {
    return (-1) ** (i + j) * minor(m, i, j);
  }

  /**
   * Compute the (i, j) minor of a non-empty, square matrix.
   *
   * @see https://en.wikipedia.org/wiki/Minor_(linear_algebra)
   * @internal
   */
  function minor(m: Matrix, i: number, j: number): number {
    return determinant(
      m
        // Remove the i-th row
        .filter((_, k) => k !== i)
        .map((r) =>
          r
            // Remove the j-th column
            .filter((_, l) => l !== j)
        )
    );
  }

  /**
   * Compute the adjugate of a non-empty, square matrix.
   *
   * @see https://en.wikipedia.org/wiki/Adjugate_matrix
   * @internal
   */
  function adjugate(m: Matrix): Matrix {
    return transpose(m.map((r, i) => r.map((_, j) => cofactor(m, i, j))));
  }
}
