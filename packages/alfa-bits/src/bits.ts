export namespace Bits {
  export function bit(i: number): number {
    return 1 << i;
  }

  export function set(bits: number, i: number): number {
    return bits | bit(i);
  }

  export function clear(bits: number, i: number): number {
    return bits & ~bit(i);
  }

  export function test(bits: number, i: number): boolean {
    return (bits & bit(i)) !== 0;
  }

  export function take(bits: number, n: number): number {
    return bits & ((1 << n) - 1);
  }

  export function skip(bits: number, n: number): number {
    return bits >>> n;
  }

  /**
   * @remarks
   * This is a 32-bit variant of the 64-bit population count algorithm outlined
   * on Wikipedia. Until ECMAScript natively provides an efficient population
   * count algorithm, this is the best we can do.
   *
   * @see https://en.wikipedia.org/wiki/Hamming_weight
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
