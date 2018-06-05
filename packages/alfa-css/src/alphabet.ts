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
function startsValidEscape(fst: number, snd: number | null): boolean {
  return fst === Char.ReverseSolidus && snd !== Char.LineFeed;
}

/**
 * @see https://www.w3.org/TR/css-syntax/#starts-with-a-number
 */
function startsNumber(
  fst: number,
  snd: number | null,
  thd: number | null
): boolean {
  if (fst === Char.PlusSign || fst === Char.HyphenMinus) {
    if (snd === Char.FullStop) {
      if (thd !== null) {
        fst = thd;
      }
    } else {
      if (snd !== null) {
        fst = snd;
      }
    }
  }

  if (fst === Char.FullStop) {
    if (snd !== null) {
      fst = snd;
    }
  }

  return isNumeric(fst);
}

/**
 * @see https://www.w3.org/TR/css-syntax/#would-start-an-identifier
 */
function startsIdentifier(
  fst: number,
  snd: number | null,
  thd: number | null
): boolean {
  if (fst === Char.HyphenMinus) {
    if (snd === null) {
      return false;
    }

    fst = snd;
    snd = thd;
  }

  return isNameStart(fst) || (snd !== null && startsValidEscape(fst, snd));
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
 * @see https://www.w3.org/TR/css-syntax/#consume-a-name
 */
function consumeName(stream: Stream<number>): string {
  let result = "";
  let next = stream.peek(0);

  while (next !== null) {
    if (startsValidEscape(next, stream.peek(1))) {
      stream.advance(1);
      result += fromCharCode(consumeEscapedCodePoint(stream));
    } else if (isName(next)) {
      stream.advance(1);
      result += fromCharCode(next);
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

  if (stream.peek(0) === Char.PlusSign || stream.peek(0) === Char.HyphenMinus) {
    stream.advance(1);
  }

  stream.accept(isNumeric);

  let isInteger = true;

  if (stream.peek(0) === Char.FullStop) {
    const next = stream.peek(1);

    if (next !== null && isNumeric(next)) {
      stream.advance(2);
      stream.accept(isNumeric);

      isInteger = false;
    }
  }

  let next = stream.peek(0);
  let offset = 0;

  if (next === Char.SmallLetterE || next === Char.CapitalLetterE) {
    offset = 1;
    next = stream.peek(offset);

    if (
      stream.peek(1) === Char.PlusSign ||
      stream.peek(1) === Char.HyphenMinus
    ) {
      offset = 2;
      next = stream.peek(offset);
    }

    if (next !== null && isNumeric(next)) {
      stream.advance(offset) && stream.accept(isNumeric);
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

  if (next !== null && startsIdentifier(next, stream.peek(1), stream.peek(2))) {
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
  const start = stream.position;
  let end = start;

  let next = stream.next();

  while (next !== null && next !== mark) {
    end++;
    next = stream.next();
  }

  return {
    type: TokenType.String,
    value: stream.reduce(
      start,
      end,
      (value, char) => value + fromCharCode(char),
      ""
    )
  };
}

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-token
 */
const initial: Pattern = (stream, emit, state) => {
  const char = stream.next();

  if (char === null) {
    return Command.End;
  }

  if (isWhitespace(char)) {
    stream.accept(isWhitespace);
    emit({ type: TokenType.Whitespace });
    return initial;
  }

  switch (char) {
    case Char.QuotationMark:
    case Char.Apostrophe:
      emit(consumeString(stream, char));
      return initial;

    case Char.LeftParenthesis:
      emit({ type: TokenType.LeftParenthesis });
      return initial;
    case Char.RightParenthesis:
      emit({ type: TokenType.RightParenthesis });
      return initial;
    case Char.LeftSquareBracket:
      emit({ type: TokenType.LeftSquareBracket });
      return initial;
    case Char.RightSquareBracket:
      emit({ type: TokenType.RightSquareBracket });
      return initial;
    case Char.LeftCurlyBracket:
      emit({ type: TokenType.LeftCurlyBracket });
      return initial;
    case Char.RightCurlyBracket:
      emit({ type: TokenType.RightCurlyBracket });
      return initial;
    case Char.Comma:
      emit({ type: TokenType.Comma });
      return initial;
    case Char.Colon:
      emit({ type: TokenType.Colon });
      return initial;
    case Char.Semicolon:
      emit({ type: TokenType.Semicolon });
      return initial;

    case Char.Solidus: {
      if (
        stream.peek(0) === Char.Asterisk &&
        stream.accept(
          token => token !== Char.Asterisk || stream.peek(0) !== Char.Solidus
        )
      ) {
        stream.advance(1);
        return initial;
      }
      break;
    }

    case Char.AtSign: {
      const char = stream.peek(0);
      if (
        char !== null &&
        startsIdentifier(char, stream.peek(1), stream.peek(2))
      ) {
        emit({ type: TokenType.AtKeyword, value: consumeName(stream) });
        return initial;
      }
    }
  }

  const snd = stream.peek(0);
  const thd = stream.peek(1);

  if (startsIdentifier(char, snd, thd)) {
    stream.backup(1);
    emit(consumeIdentLike(stream));
    return initial;
  }

  if (startsNumber(char, snd, thd)) {
    stream.backup(1);
    emit(consumeNumeric(stream));
    return initial;
  }

  emit({ type: TokenType.Delim, value: char });

  return initial;
};

export const Alphabet: Lang.Alphabet<Token> = new Lang.Alphabet(
  initial,
  () => null
);
