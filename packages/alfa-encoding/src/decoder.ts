/**
 * @see https://encoding.spec.whatwg.org/#textdecoder
 */
export namespace Decoder {
  /**
   * @see https://encoding.spec.whatwg.org/#dom-textdecoder-decode
   * @see https://encoding.spec.whatwg.org/#utf-8-decoder
   */
  export function decode(input: Uint8Array): string {
    let output = "";
    let i = 0;

    while (i < input.length) {
      let byte = input[i];
      let bytesNeeded = 0;
      let codePoint = 0;

      if (byte <= 0x7f) {
        bytesNeeded = 0;
        codePoint = byte & 0xff;
      } else if (byte <= 0xdf) {
        bytesNeeded = 1;
        codePoint = byte & 0x1f;
      } else if (byte <= 0xef) {
        bytesNeeded = 2;
        codePoint = byte & 0x0f;
      } else if (byte <= 0xf4) {
        bytesNeeded = 3;
        codePoint = byte & 0x07;
      }

      if (input.length - i - bytesNeeded > 0) {
        let k = 0;
        while (k < bytesNeeded) {
          byte = input[i + k + 1];
          codePoint = (codePoint << 6) | (byte & 0x3f);
          k += 1;
        }
      } else {
        codePoint = 0xfffd;
        bytesNeeded = input.length - i;
      }

      output += String.fromCodePoint(codePoint);
      i += bytesNeeded + 1;
    }

    return output;
  }
}
