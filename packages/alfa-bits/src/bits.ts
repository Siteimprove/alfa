/**
 * @public
 */
export namespace Bits {
  /**
   * Returns a number whose binary representation has a 1 in the ith position.
   */
  export function bit(i: number): number {
    return 1 << i;
  }

  /**
   * Returns the input with the ith bit is set to 1.
   */
  export function set(bits: number, i: number): number {
    return bits | bit(i);
  }

  /**
   * Returns the input with the ith bit is set to 0.
   */
  export function clear(bits: number, i: number): number {
    return bits & ~bit(i);
  }

  /**
   * Returns true if the ith bit is 1.
   */
  export function test(bits: number, i: number): boolean {
    return (bits & bit(i)) !== 0;
  }

  /**
   * Returns the input with only the n least signifant bits.
   */
  export function take(bits: number, n: number): number {
    return bits & ((1 << n) - 1);
  }

  /**
   * Returns the input with the n least signifant bits removed.
   */
  export function skip(bits: number, n: number): number {
    return bits >>> n;
  }

  /**
   * @remarks
   * This is a 32-bit variant of the 64-bit population count algorithm outlined
   * on Wikipedia. Until ECMAScript natively provides an efficient population
   * count algorithm, this is the best we can do.
   *
   * {@link https://en.wikipedia.org/wiki/Hamming_weight}
   */
  export function popCount(bits: number): number {
    bits -= (bits >> 1) & 0x55555555;
    bits = (bits & 0x33333333) + ((bits >> 2) & 0x33333333);
    bits = (bits + (bits >> 4)) & 0x0f0f0f0f;
    bits += bits >> 8;
    bits += bits >> 16;
    return bits & 0x7f;
  }
}
