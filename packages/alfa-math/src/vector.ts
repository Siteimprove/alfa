import * as math from "mathjs";

export type Vector<N extends number = number> = [number, ...Array<number>] & {
  readonly length: N;
};

export function Vector<N extends number>(vector: Vector<N>): Vector<N> {
  return vector;
}

export namespace Vector {
  export function clone<N extends number>(vector: Vector<N>): Vector<N> {
    return vector.slice() as Vector<N>;
  }

  export function multiply<N extends number>(
    vector: Vector<N>,
    scalar: number
  ): Vector<N>;

  export function multiply<N extends number>(
    a: Vector<N>,
    b: Vector<N>
  ): number;

  export function multiply<N extends number>(
    a: Vector<N>,
    b: Vector<N> | number
  ): Vector<N> | number {
    return math.multiply(a, b) as Vector<N> | number;
  }

  export function divide<N extends number>(
    vector: Vector<N>,
    scalar: number
  ): Vector<N> {
    return math.divide(vector, scalar) as Vector<N>;
  }

  export function cross(a: Vector<3>, b: Vector<3>): Vector<3> {
    return math.cross(a, b) as Vector<3>;
  }

  export function norm(vector: Vector): number {
    return math.norm(vector) as number;
  }

  export function normalize<N extends number>(vector: Vector<N>): Vector<N> {
    return divide(vector, norm(vector));
  }
}
