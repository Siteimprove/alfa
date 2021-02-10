const { abs, min, max } = Math;

/**
 * @see https://en.wikipedia.org/wiki/Real_number
 */
export namespace Real {
  export function isReal(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
  }

  export function add(p: number, q: number): number {
    return p + q;
  }

  export function subtract(p: number, q: number): number {
    return p - q;
  }

  export function multiply(p: number, q: number): number {
    return p * q;
  }

  export function divide(p: number, d: number): number {
    return p / d;
  }

  /**
   * Compute the modulus of a division of two reals.
   *
   * @see https://en.wikipedia.org/wiki/Modulo_operation
   *
   * @remarks
   * The modulo operation is different from the remainder operation supported
   * natively in JavaScript through the % operator.
   */
  export function modulo(p: number, d: number): number {
    return ((p % d) + d) % d;
  }

  /**
   * Clamp a real between a lower and an upper value.
   */
  export function clamp(p: number, l: number, u: number): number {
    return max(l, min(p, u));
  }

  /**
   * Round a real to a given number of decimals.
   */
  export function round(p: number, n: number = 0): number {
    return n === 0 ? Math.round(p) : Math.round(p * 10 ** n) / 10 ** n;
  }

  /**
   * Check if two reals are equal, accounting for floating-point precision
   * errors according to a given epsilon.
   */
  export function equals(
    a: number,
    b: number,
    e: number = Number.EPSILON
  ): boolean {
    if (a === b) {
      return true;
    }

    const diff = abs(a - b);

    if (a === 0 || b === 0) {
      return diff < e;
    }

    return diff / min(abs(b) + abs(a), Number.MAX_VALUE) < e;
  }
}
