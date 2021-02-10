import { Real } from "./real";

const { sqrt } = Math;

/**
 * @see https://en.wikipedia.org/wiki/Vector_(mathematics_and_physics)
 */
export type Vector = Array<number>;

export namespace Vector {
  export function isVector(value: unknown): value is Vector {
    return Array.isArray(value) && value.every((n) => typeof n === "number");
  }

  export function clone(v: Vector): Vector {
    return v.slice(0);
  }

  export function equals(v: Vector, u: Vector, e: number): boolean {
    return v.length === u.length && v.every((n, i) => Real.equals(n, u[i], e));
  }

  export function size(v: Vector): number {
    return v.length;
  }

  export function add(v: Vector, u: Vector): Vector {
    return v.map((n, i) => n + u?.[i]);
  }

  export function subtract(v: Vector, u: Vector): Vector {
    return v.map((n, i) => n - u?.[i]);
  }

  export function multiply(v: Vector, s: number): Vector {
    return v.map((n) => n * s);
  }

  export function divide(v: Vector, d: number): Vector {
    return v.map((n) => n / d);
  }

  /**
   * Compute the dot product of two non-empty, equal length vectors.
   *
   * @see https://en.wikipedia.org/wiki/Dot_product
   */
  export function dot(v: Vector, u: Vector): number {
    return v.reduce((s, n, i) => s + n * u?.[i], 0);
  }

  /**
   * Compute the cross product of two 3-dimensional vectors.
   *
   * @see https://en.wikipedia.org/wiki/Cross_product
   */
  export function cross(v: Vector, u: Vector): Vector {
    const [vx, vy, vz] = v;
    const [ux, uy, uz] = u;

    return [vy * uz - vz * uy, vz * ux - vx * uz, vx * uy - vy * ux];
  }

  /**
   * Compute the norm of a vector.
   *
   * @see https://en.wikipedia.org/wiki/Norm_(mathematics)
   */
  export function norm(v: Vector): number {
    return sqrt(v.reduce((s, n) => s + n ** 2, 0));
  }

  /**
   * Compute a unit vector corresponding to a vector.
   *
   * @see https://en.wikipedia.org/wiki/Unit_vector
   */
  export function normalize(v: Vector): Vector {
    return divide(v, norm(v));
  }
}
