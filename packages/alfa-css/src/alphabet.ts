import * as Lang from "@siteimprove/alfa-lang";
import {
  Stream,
  Command,
  Char,
  isWhitespace,
  isAlpha,
  isBetween,
  isHex,
  isNumeric,
  isAscii
} from "@siteimprove/alfa-lang";

const { fromCharCode } = String;
const { pow } = Math;

export const enum TokenType {
  Ident,
  FunctionName,
  AtKeyword,
  String,
  Url,
  Delim,
  Number,
  Percentage,
  Dimension,
  Whitespace,
  Colon,
  Semicolon,
  Comma,
  LeftParenthesis,
  RightParenthesis,
  LeftSquareBracket,
  RightSquareBracket,
  LeftCurlyBracket,
  RightCurlyBracket
}

export type Ident = Readonly<{ type: TokenType.Ident; value: string }>;

export type FunctionName = Readonly<{
  type: TokenType.FunctionName;
  value: string;
}>;

export type AtKeyword = Readonly<{ type: TokenType.AtKeyword; value: string }>;

export type String = Readonly<{
  type: TokenType.String;
  value: string;
  mark: Char.QuotationMark | Char.Apostrophe;
}>;

export type Url = Readonly<{ type: TokenType.Url; value: string }>;

export type Delim = Readonly<{ type: TokenType.Delim; value: number }>;

export type Number = Readonly<{
  type: TokenType.Number;
  value: number;
  integer: boolean;
}>;

export type Percentage = Readonly<{
  type: TokenType.Percentage;
  value: number;
  integer: boolean;
}>;

export type Dimension = Readonly<{
  type: TokenType.Dimension;
  value: number;
  integer: boolean;
  unit: string;
}>;

export type Whitespace = Readonly<{ type: TokenType.Whitespace }>;

export type Colon = Readonly<{ type: TokenType.Colon }>;

export type Semicolon = Readonly<{ type: TokenType.Semicolon }>;

export type Comma = Readonly<{ type: TokenType.Comma }>;

export type Parenthesis = Readonly<{
  type: TokenType.LeftParenthesis | TokenType.RightParenthesis;
}>;

export type SquareBracket = Readonly<{
  type: TokenType.LeftSquareBracket | TokenType.RightSquareBracket;
}>;

export type CurlyBracket = Readonly<{
  type: TokenType.LeftCurlyBracket | TokenType.RightCurlyBracket;
}>;

/**
 * @see https://www.w3.org/TR/css-syntax/#tokenization
 */
export type Token =
  // Value tokens
  | Ident
  | FunctionName
  | AtKeyword
  | String
  | Url
  | Delim
  | Number
  | Percentage
  | Dimension
  // Character tokens
  | Whitespace
  | Colon
  | Semicolon
  | Comma
  | Parenthesis
  | SquareBracket
  | CurlyBracket;

export type Pattern = Lang.Pattern<Token>;

/**
 * @see https://www.w3.org/TR/css-syntax/#starts-with-a-valid-escape
 */
function startsValidEscape(fst: number, stream: Stream<number>): boolean {
  if (fst !== Char.ReverseSolidus) {
    return false;
  }

  const snd = stream.peek(1);

  return snd !== Char.LineFeed;
}

/**
 * @see https://www.w3.org/TR/css-syntax/#starts-with-a-number
 */
function startsNumber(fst: number, stream: Stream<number>): boolean {
  if (fst === Char.PlusSign || fst === Char.HyphenMinus) {
    const snd = stream.peek(1);

    if (snd !== null) {
      if (isNumeric(snd)) {
        return true;
      }

      if (snd === Char.FullStop) {
        const thd = stream.peek(2);

        if (thd !== null) {
          return isNumeric(thd);
        }
      }
    }

    return false;
  }

  if (fst === Char.FullStop) {
    const snd = stream.peek(1);

    if (snd !== null) {
      return isNumeric(snd);
    }

    return false;
  }

  return isNumeric(fst);
}

/**
 * @see https://www.w3.org/TR/css-syntax/#would-start-an-identifier
 */
function startsIdentifier(fst: number, stream: Stream<number>): boolean {
  if (fst === Char.HyphenMinus) {
    const snd = stream.peek(1);

    if (snd !== null) {
      if (isNameStart(snd)) {
        return true;
      }

      const thd = stream.peek(2);

      if (thd !== null) {
        return isValidEscape(snd, thd);
      }
    }

    return false;
  }

  if (fst === Char.ReverseSolidus) {
    const snd = stream.peek(1);

    if (snd !== null) {
      return isValidEscape(fst, snd);
    }

    return false;
  }

  return isNameStart(fst);
}

/**
 * @see https://www.w3.org/TR/css-syntax/#name-start-code-point
 */
function isNameStart(char: number): boolean {
  return isAlpha(char) || !isAscii(char) || char === Char.LowLine;
}

/**
 * @see https://www.w3.org/TR/css-syntax/#name-code-point
 */
function isName(char: number): boolean {
  return isNameStart(char) || isNumeric(char) || char === Char.HyphenMinus;
}

/**
 * @see https://www.w3.org/TR/css-syntax/#starts-with-a-valid-escape
 */
function isValidEscape(fst: number, snd: number): boolean {
  return fst === Char.ReverseSolidus && snd !== Char.LineFeed;
}

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-name
 */
function consumeName(char: number, stream: Stream<number>): string {
  let result = "";
  let next: number | null = char;

  while (next !== null) {
    if (isName(next)) {
      stream.advance(1);
      result += fromCharCode(next);
    } else if (startsValidEscape(next, stream)) {
      stream.advance(1);
      result += fromCharCode(consumeEscapedCodePoint(stream));
    } else {
      break;
    }

    next = stream.peek(0);
  }

  return result;
}

const replacementCharacter = 0xfffd;

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-an-escaped-code-point
 */
function consumeEscapedCodePoint(stream: Stream<number>): number {
  const char = stream.next();

  if (char === null) {
    return replacementCharacter;
  }

  if (isHex(char)) {
    const bytes = [char];

    for (let i = 0; i < 5; i++) {
      const next = stream.peek(0);

      if (next !== null && isHex(next)) {
        stream.advance(1);
        bytes.push(next);
      }
    }

    let code = 0;

    for (let i = 0, n = bytes.length; i < n; i++) {
      let byte = bytes[i];

      if (isNumeric(byte)) {
        byte = byte - Char.DigitZero;
      } else if (isBetween(byte, Char.SmallLetterA, Char.SmallLetterF)) {
        byte = byte - Char.SmallLetterA + 10;
      } else if (isBetween(byte, Char.CapitalLetterA, Char.CapitalLetterF)) {
        byte = byte - Char.CapitalLetterA + 10;
      }

      code = 0x10 * code + byte;
    }

    const next = stream.peek(0);

    if (next !== null && isWhitespace(next)) {
      stream.advance(1);
    }

    if (code === 0 || isBetween(code, 0xd800, 0xdfff) || code > 0x10ffff) {
      return replacementCharacter;
    }

    return code;
  }

  return char;
}

/**
 * @see https://www.w3.org/TR/css-syntax/#convert-a-string-to-a-number
 */
function consumeInteger(input: Array<number>): number {
  let integer = 0;
  let sign = 1;

  for (let i = 0, n = input.length; i < n; i++) {
    const char = input[i];

    if (char === Char.HyphenMinus) {
      sign = -1;
      continue;
    }

    if (char === Char.PlusSign) {
      continue;
    }

    if (char === Char.FullStop) {
      return sign * consumeFraction(input, i + 1, integer);
    }

    if (char === Char.SmallLetterE || char === Char.CapitalLetterE) {
      return sign * consumeExponent(input, i + 1, integer);
    }

    integer = integer * 10 + char - Char.DigitZero;
  }

  return sign * integer;
}

/**
 * NB: To account for floating point precision errors, we flip the sign of the
 * number of digits and divide rather than multiply it with the given number.
 *
 * @see https://www.w3.org/TR/css-syntax/#convert-a-string-to-a-number
 */
function consumeFraction(
  input: Array<number>,
  start: number,
  integer: number
): number {
  let fraction = 0;
  let digits = 0;

  for (let i = start, n = input.length; i < n; i++) {
    const char = input[i];

    if (char === Char.SmallLetterE || char === Char.CapitalLetterE) {
      return consumeExponent(
        input,
        i + 1,
        integer + fraction / pow(10, digits)
      );
    }

    fraction = fraction * 10 + char - Char.DigitZero;
    digits++;
  }

  return integer + fraction / pow(10, digits);
}

/**
 * NB: To account for floating point precision errors, we flip the sign of the
 * exponent and divide rather than multiply it with the given number.
 *
 * @see https://www.w3.org/TR/css-syntax/#convert-a-string-to-a-number
 */
function consumeExponent(
  input: Array<number>,
  start: number,
  number: number
): number {
  let exponent = 0;
  let sign = -1;

  for (let i = start, n = input.length; i < n; i++) {
    const char = input[i];

    if (char === Char.HyphenMinus) {
      sign = 1;
      continue;
    }

    if (char === Char.PlusSign) {
      continue;
    }

    exponent = exponent * 10 + char - Char.DigitZero;
  }

  return number / pow(10, sign * exponent);
}

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-number
 */
function consumeNumber(char: number, stream: Stream<number>): Number {
  const result: Array<number> = [];

  let next: number | null = char;

  if (next === Char.PlusSign || next === Char.HyphenMinus) {
    result.push(next);
    stream.advance(1);
  }

  const numbers = stream.accept(isNumeric);

  if (numbers !== false) {
    result.push(...numbers);
  }

  next = stream.peek(0);

  let isInteger = true;

  if (next === Char.FullStop) {
    const char = stream.peek(1);

    if (char !== null && isNumeric(char)) {
      result.push(next, char);
      stream.advance(2);
      isInteger = false;

      const numbers = stream.accept(isNumeric);

      if (numbers !== false) {
        result.push(...numbers);
      }

      next = stream.peek(0);
    }
  }

  let offset = 0;

  if (next === Char.SmallLetterE || next === Char.CapitalLetterE) {
    result.push(next);
    offset = 1;
    next = stream.peek(offset);
    isInteger = false;

    if (next === Char.PlusSign || next === Char.HyphenMinus) {
      offset = 2;
      result.push(next);
      next = stream.peek(offset);
    }

    if (next !== null && isNumeric(next)) {
      stream.advance(offset);

      const numbers = stream.accept(isNumeric);

      if (numbers !== false) {
        result.push(...numbers);
      }
    }
  }

  return {
    type: TokenType.Number,
    value: consumeInteger(result),
    integer: isInteger
  };
}

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-numeric-token
 */
function consumeNumeric(
  char: number,
  stream: Stream<number>
): Number | Dimension | Percentage {
  const number = consumeNumber(char, stream);

  const next = stream.peek(0);

  if (next !== null && startsIdentifier(next, stream)) {
    return {
      type: TokenType.Dimension,
      value: number.value,
      integer: number.integer,
      unit: consumeName(next, stream)
    };
  }

  if (next === Char.PercentSign) {
    stream.advance(1);

    return {
      type: TokenType.Percentage,
      value: number.value / 100,
      integer: number.integer
    };
  }

  return number;
}

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-an-ident-like-token
 */
function consumeIdentLike(
  start: number,
  stream: Stream<number>
): Ident | FunctionName | Url {
  const value = consumeName(start, stream);

  const char = stream.peek(0);

  if (value.toLowerCase() === "url" && char === Char.LeftParenthesis) {
    stream.advance(1);
    return consumeUrl(stream);
  }

  if (char === Char.LeftParenthesis) {
    stream.advance(1);
    return { type: TokenType.FunctionName, value };
  }

  return { type: TokenType.Ident, value };
}

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-string-token
 */
function consumeString(
  stream: Stream<number>,
  mark: Char.QuotationMark | Char.Apostrophe
): String {
  let value = "";
  let char = stream.next();

  while (char !== null && char !== mark) {
    value += fromCharCode(char);
    char = stream.next();
  }

  return { type: TokenType.String, value, mark };
}

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-url-token
 */
function consumeUrl(stream: Stream<number>): Url {
  stream.accept(isWhitespace);

  let char = stream.next();

  if (char === null) {
    return { type: TokenType.Url, value: "" };
  }

  if (char === Char.QuotationMark || char === Char.Apostrophe) {
    const { value } = consumeString(stream, char);

    stream.accept(isWhitespace);

    char = stream.next();

    if (char === null || char === Char.RightParenthesis) {
      return { type: TokenType.Url, value };
    }
  }

  let value = "";

  while (char !== null && char !== Char.RightParenthesis) {
    value += fromCharCode(char);
    char = stream.next();
  }

  return { type: TokenType.Url, value };
}

const tokens: { [char: number]: Token } = {
  [Char.Comma]: { type: TokenType.Comma },
  [Char.Colon]: { type: TokenType.Colon },
  [Char.Semicolon]: { type: TokenType.Semicolon },

  [Char.LeftParenthesis]: { type: TokenType.LeftParenthesis },
  [Char.RightParenthesis]: { type: TokenType.RightParenthesis },
  [Char.LeftSquareBracket]: { type: TokenType.LeftSquareBracket },
  [Char.RightSquareBracket]: { type: TokenType.RightSquareBracket },
  [Char.LeftCurlyBracket]: { type: TokenType.LeftCurlyBracket },
  [Char.RightCurlyBracket]: { type: TokenType.RightCurlyBracket }
};

const whitespace: Whitespace = { type: TokenType.Whitespace };

// CSS uses a fairly limited set of delimiters so there's quite a bit to be
// gained from caching them as they are encoutered. Even in the case that every
// single character in the UTF-16 range is somehow treated as a delimiter, the
// cache won't contain more than 2^16 = 65536 entries, amounting to no more than
// at most a couple of megabytes.
const delims: Map<number, Delim> = new Map();

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-token
 */
function consumeToken(stream: Stream<number>): Token | null {
  let char = stream.peek(0);

  if (char === null) {
    return null;
  }

  switch (char) {
    case Char.PlusSign:
    case Char.FullStop:
      if (startsNumber(char, stream)) {
        return consumeNumeric(char, stream);
      }
      break;

    case Char.HyphenMinus:
      if (startsIdentifier(char, stream)) {
        return consumeIdentLike(char, stream);
      }
      if (startsNumber(char, stream)) {
        return consumeNumeric(char, stream);
      }
      break;

    case Char.ReverseSolidus:
      if (startsValidEscape(char, stream)) {
        return consumeIdentLike(char, stream);
      }
      break;
  }

  if (isNameStart(char)) {
    return consumeIdentLike(char, stream);
  }

  if (isNumeric(char)) {
    return consumeNumeric(char, stream);
  }

  stream.advance(1);

  if (char in tokens) {
    return tokens[char];
  }

  switch (char) {
    case Char.QuotationMark:
    case Char.Apostrophe:
      return consumeString(stream, char);

    case Char.Solidus: {
      let next = stream.peek(0);
      if (next === Char.Asterisk) {
        stream.advance(1);

        let prev = stream.peek(0);
        let next = stream.peek(1);

        while (prev !== null) {
          if (prev === Char.Asterisk && next === Char.Solidus) {
            break;
          }

          stream.advance(1);
          prev = next;
          next = stream.peek(0);
        }

        if (prev === Char.Asterisk && next === Char.Solidus) {
          stream.advance(1);
        }

        return consumeToken(stream);
      }
      break;
    }

    case Char.AtSign: {
      const char = stream.peek(0);
      if (char !== null && startsIdentifier(char, stream)) {
        return {
          type: TokenType.AtKeyword,
          value: consumeName(char, stream)
        };
      }
    }
  }

  if (isWhitespace(char)) {
    stream.accept(isWhitespace);
    return whitespace;
  }

  let delim = delims.get(char);

  if (delim === undefined) {
    delim = { type: TokenType.Delim, value: char };
    delims.set(char, delim);
  }

  return delim;
}

const initial: Pattern = (stream, emit) => {
  const token = consumeToken(stream);

  if (token === null) {
    return Command.End;
  }

  emit(token);
};

export const Alphabet: Lang.Alphabet<Token> = new Lang.Alphabet(
  initial,
  () => null
);
