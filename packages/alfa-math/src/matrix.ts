import * as math from "mathjs";
import { Vector } from "./vector";

export type Matrix<N extends number = number, M extends number = number> = [
  Vector<M>,
  ...Array<Vector<M>>
] & { readonly length: N };

export function Matrix<N extends number, M extends number>(
  matrix: Matrix<N, M>
): Matrix<N, M> {
  return matrix;
}

export namespace Matrix {
  export function identity<N extends number, M extends number>(
    n: N,
    m: M
  ): Matrix<N, M> {
    return math.identity([n, m]) as Matrix<N, M>;
  }

  export function multiply<
    N extends number,
    M extends number,
    P extends number
  >(a: Matrix<N, M>, b: Matrix<M, P>): Matrix<N, P> {
    return math.multiply(a, b) as Matrix<N, P>;
  }
}
