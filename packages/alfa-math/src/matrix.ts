import * as math from "mathjs";
import { Vector } from "./vector";

export type Matrix<M extends number = number, N extends number = number> = [
  Vector<N>,
  ...Array<Vector<N>>
] & { readonly length: M };

export namespace Matrix {
  export function of<M extends number, N extends number>(
    matrix: Matrix<M, N>
  ): Matrix<M, N> {
    return matrix;
  }

  export function identity<M extends number, N extends number>(
    m: M,
    n: N
  ): Matrix<M, N> {
    return math.identity([m, n]) as Matrix<M, N>;
  }

  export function clone<M extends number, N extends number>(
    matrix: Matrix<M, N>
  ): Matrix<M, N> {
    return matrix.map((vector) => Vector.clone(vector)) as Matrix<M, N>;
  }

  export function multiply<M extends number, N extends number>(
    matrix: Matrix<M, N>,
    vector: Vector<N>
  ): Vector<N>;

  export function multiply<
    N extends number,
    M extends number,
    P extends number
  >(a: Matrix<N, M>, b: Matrix<M, P>): Matrix<N, P>;

  export function multiply<
    N extends number,
    M extends number,
    P extends number
  >(a: Matrix<N, M>, b: Matrix<M, P> | Vector<M>): Matrix<N, P> | Vector<M> {
    return math.multiply(a as math.MathType, b) as Matrix<N, P> | Vector<M>;
  }

  export function transpose<M extends number, N extends number>(
    matrix: Matrix<M, N>
  ): Matrix<M, N> {
    return math.transpose(matrix) as Matrix<M, N>;
  }

  export function inverse<N extends number>(
    matrix: Matrix<N, N>
  ): Matrix<N, N> {
    return math.inv(matrix) as Matrix<N, N>;
  }

  export function determinant(matrix: Matrix): number {
    return math.det(matrix);
  }
}
