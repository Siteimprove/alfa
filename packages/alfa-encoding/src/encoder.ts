/**
 * @see https://encoding.spec.whatwg.org/#textencoder
 */
export namespace Encoder {
  /**
   * @see https://encoding.spec.whatwg.org/#dom-textencoder-encode
   * @see https://encoding.spec.whatwg.org/#utf-8-encoder
   */
  export function encode(input: string): Uint8Array {
    const output: Array<number> = [];
    const length = input.length;

    let i = 0;

    while (i < length) {
      const codePoint = input.codePointAt(i)!;

      let count = 0;
      let bits = 0;

      if (codePoint <= 0x7f) {
        count = 0;
        bits = 0x00;
      } else if (codePoint <= 0x7ff) {
        count = 6;
        bits = 0xc0;
      } else if (codePoint <= 0xffff) {
        count = 12;
        bits = 0xe0;
      } else if (codePoint <= 0x1fffff) {
        count = 18;
        bits = 0xf0;
      }

      output.push(bits | (codePoint >> count));

      count -= 6;

      while (count >= 0) {
        output.push(0x80 | ((codePoint >> count) & 0x3f));
        count -= 6;
      }

      i += codePoint >= 0x10000 ? 2 : 1;
    }

    return new Uint8Array(output);
  }
}
