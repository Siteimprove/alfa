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

export type String = Readonly<{ type: TokenType.String; value: string }>;

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
function consumeName(stream: Stream<number>): string {
  let result = "";
  let next = stream.peek(0);

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
  let result = 0;
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
      return consumeFraction(input, i + 1, result) * sign;
    }

    if (char === Char.SmallLetterE || char === Char.CapitalLetterE) {
      return consumeExponent(input, i + 1, result) * sign;
    }

    result = result * 10 + char - Char.DigitZero;
  }

  return result * sign;
}

/**
 * @see https://www.w3.org/TR/css-syntax/#convert-a-string-to-a-number
 */
function consumeFraction(
  input: Array<number>,
  start: number,
  result: number
): number {
  let power = 0.1;

  for (let i = start, n = input.length; i < n; i++, power /= 10) {
    const char = input[i];

    if (char === Char.SmallLetterE || char === Char.CapitalLetterE) {
      return consumeExponent(input, i + 1, result);
    }

    result = result + power * (char - Char.DigitZero);
  }

  return result;
}

/**
 * @see https://www.w3.org/TR/css-syntax/#convert-a-string-to-a-number
 */
function consumeExponent(
  input: Array<number>,
  start: number,
  result: number
): number {
  let power = 0;
  let sign = 1;

  for (let i = start, n = input.length; i < n; i++) {
    const char = input[i];

    if (char === Char.HyphenMinus) {
      sign = -1;
      continue;
    }

    if (char === Char.PlusSign) {
      continue;
    }

    power = power * 10 + char - Char.DigitZero;
  }

  return result * pow(10, power * sign);
}

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-number
 */
function consumeNumber(stream: Stream<number>): Number {
  const start = stream.position;

  let next = stream.peek(0);

  if (next === Char.PlusSign || next === Char.HyphenMinus) {
    stream.advance(1);
  }

  stream.accept(isNumeric);

  next = stream.peek(0);

  let isInteger = true;

  if (next === Char.FullStop) {
    next = stream.peek(1);

    if (next !== null && isNumeric(next)) {
      stream.advance(2);
      stream.accept(isNumeric);

      isInteger = false;
    }

    next = stream.peek(0);
  }

  let offset = 0;

  if (next === Char.SmallLetterE || next === Char.CapitalLetterE) {
    offset = 1;
    next = stream.peek(offset);

    if (next === Char.PlusSign || next === Char.HyphenMinus) {
      offset = 2;
      next = stream.peek(offset);
    }

    if (next !== null && isNumeric(next)) {
      stream.advance(offset);
      stream.accept(isNumeric);
    }
  }

  return {
    type: TokenType.Number,
    value: consumeInteger(stream.range(start, stream.position)),
    integer: isInteger
  };
}

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-numeric-token
 */
function consumeNumeric(
  stream: Stream<number>
): Number | Dimension | Percentage {
  const number = consumeNumber(stream);

  const next = stream.peek(0);

  if (next !== null && startsIdentifier(next, stream)) {
    return {
      type: TokenType.Dimension,
      value: number.value,
      integer: number.integer,
      unit: consumeName(stream)
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
function consumeIdentLike(stream: Stream<number>): Ident | FunctionName {
  const value = consumeName(stream);

  if (stream.peek(0) === Char.LeftParenthesis) {
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

  return { type: TokenType.String, value };
}

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-token
 */
function consumeToken(stream: Stream<number>): Token | null {
  let char = stream.peek(0);

  if (char === null) {
    return null;
  }

  if (isWhitespace(char)) {
    stream.advance(1);
    stream.accept(isWhitespace);

    return { type: TokenType.Whitespace };
  }

  if (startsIdentifier(char, stream)) {
    return consumeIdentLike(stream);
  }

  if (startsNumber(char, stream)) {
    return consumeNumeric(stream);
  }

  stream.advance(1);

  switch (char) {
    case Char.QuotationMark:
    case Char.Apostrophe:
      return consumeString(stream, char);

    case Char.Comma:
      return { type: TokenType.Comma };
    case Char.Colon:
      return { type: TokenType.Colon };
    case Char.Semicolon:
      return { type: TokenType.Semicolon };

    case Char.LeftParenthesis:
      return { type: TokenType.LeftParenthesis };
    case Char.RightParenthesis:
      return { type: TokenType.RightParenthesis };
    case Char.LeftSquareBracket:
      return { type: TokenType.LeftSquareBracket };
    case Char.RightSquareBracket:
      return { type: TokenType.RightSquareBracket };
    case Char.LeftCurlyBracket:
      return { type: TokenType.LeftCurlyBracket };
    case Char.RightCurlyBracket:
      return { type: TokenType.RightCurlyBracket };
  }

  if (char === Char.Solidus) {
    const char = stream.peek(0);

    if (char === Char.Asterisk) {
      stream.advance(1);

      if (
        stream.accept(
          char => char !== Char.Asterisk && stream.peek(0) !== Char.Solidus
        )
      ) {
        stream.advance(2);
      }

      return consumeToken(stream);
    }
  }

  if (char === Char.AtSign) {
    const char = stream.peek(0);

    if (char !== null && startsIdentifier(char, stream)) {
      return { type: TokenType.AtKeyword, value: consumeName(stream) };
    }
  }

  return { type: TokenType.Delim, value: char };
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
