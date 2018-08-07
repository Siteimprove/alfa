import { Char, isBetween } from "@siteimprove/alfa-lang";

const { fromCharCode } = String;

/**
 * @see https://www.w3.org/TR/cssom/#the-css.escape%28%29-method
 */
export function escape(input: string) {
  let result = "";

  for (let i = 0, n = input.length; i < n; i++) {
    const byte = input.charCodeAt(i);

    if (byte === Char.Null) {
      result += "\ufffd";
    } else if (isBetween(byte, 0x0001, 0x001f) || byte === 0x007f) {
      result += escapeCharacterAsCodePoint(byte);
    } else if (i === 0 && isBetween(byte, 0x0030, 0x0039)) {
      result += escapeCharacterAsCodePoint(byte);
    } else if (
      i === 1 &&
      isBetween(byte, 0x0030, 0x0039) &&
      input.charCodeAt(0) === Char.HyphenMinus
    ) {
      result += escapeCharacterAsCodePoint(byte);
    } else if (i === 0 && byte === 0x002d && n === 1) {
      result += escapeCharacter(byte);
    } else if (
      byte >= 0x0080 ||
      byte === 0x002d ||
      byte === 0x005f ||
      isBetween(byte, 0x0030, 0x0039) ||
      isBetween(byte, 0x0041, 0x005a) ||
      isBetween(byte, 0x0061, 0x007a)
    ) {
      result += fromCharCode(byte);
    } else {
      result += escapeCharacter(byte);
    }
  }

  return result;
}

/**
 * @see https://www.w3.org/TR/cssom/#escape-a-character
 */
function escapeCharacter(character: number) {
  return `${fromCharCode(Char.Escape)}${character.toString(16)}`;
}

/**
 * @see https://www.w3.org/TR/cssom/#escape-a-character-as-code-point
 */
function escapeCharacterAsCodePoint(character: number) {
  return `${escapeCharacter(character)}${fromCharCode(Char.Space)}`;
}
