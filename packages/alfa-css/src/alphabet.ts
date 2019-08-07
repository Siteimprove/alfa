import * as Lang from "@siteimprove/alfa-lang";
import {
  Char,
  isAlpha,
  isAscii,
  isBetween,
  isHex,
  isNumeric,
  isWhitespace,
  Stream
} from "@siteimprove/alfa-lang";

const { fromCharCode } = String;
const { pow } = Math;

export const enum TokenType {
  Ident,
  FunctionName,
  AtKeyword,
  Hash,
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
  RightCurlyBracket,
  VerticalLine,
  Column,
  IncludeMatch,
  DashMatch,
  PrefixMatch,
  SuffixMatch,
  SubstringMatch
}

export namespace Tokens {
  interface Token<T extends TokenType> extends Lang.Token<T> {}

  export interface Ident extends Token<TokenType.Ident> {
    readonly value: string;
  }

  export interface FunctionName extends Token<TokenType.FunctionName> {
    readonly value: string;
  }

  export interface AtKeyword extends Token<TokenType.AtKeyword> {
    readonly value: string;
  }

  export interface Hash extends Token<TokenType.Hash> {
    readonly unrestricted: boolean;
    readonly value: string;
  }

  export interface String extends Token<TokenType.String> {
    readonly value: string;
    readonly mark: Char.QuotationMark | Char.Apostrophe;
  }

  export interface Url extends Token<TokenType.Url> {
    readonly value: string;
  }

  export interface Delim extends Token<TokenType.Delim> {
    readonly value: number;
  }

  export interface Number extends Token<TokenType.Number> {
    readonly value: number;
    readonly integer: boolean;
    readonly signed: boolean;
  }

  export interface Percentage extends Token<TokenType.Percentage> {
    readonly value: number;
    readonly integer: boolean;
  }

  export interface Dimension extends Token<TokenType.Dimension> {
    readonly value: number;
    readonly integer: boolean;
    readonly signed: boolean;
    readonly unit: string;
  }

  export interface Whitespace extends Token<TokenType.Whitespace> {}

  export interface Colon extends Token<TokenType.Colon> {}

  export interface Semicolon extends Token<TokenType.Semicolon> {}

  export interface Comma extends Token<TokenType.Comma> {}

  export interface Parenthesis
    extends Token<TokenType.LeftParenthesis | TokenType.RightParenthesis> {}

  export interface SquareBracket
    extends Token<TokenType.LeftSquareBracket | TokenType.RightSquareBracket> {}

  export interface CurlyBracket
    extends Token<TokenType.LeftCurlyBracket | TokenType.RightCurlyBracket> {}

  export interface Column extends Token<TokenType.Column> {}

  export interface IncludeMatch extends Token<TokenType.IncludeMatch> {}

  export interface DashMatch extends Token<TokenType.DashMatch> {}

  export interface PrefixMatch extends Token<TokenType.PrefixMatch> {}

  export interface SuffixMatch extends Token<TokenType.SuffixMatch> {}

  export interface SubstringMatch extends Token<TokenType.SubstringMatch> {}
}

/**
 * @see https://www.w3.org/TR/css-syntax/#tokenization
 */
export type Token =
  // Value tokens
  | Tokens.Ident
  | Tokens.FunctionName
  | Tokens.AtKeyword
  | Tokens.Hash
  | Tokens.String
  | Tokens.Url
  | Tokens.Delim
  | Tokens.Number
  | Tokens.Percentage
  | Tokens.Dimension

  // Character tokens
  | Tokens.Whitespace
  | Tokens.Colon
  | Tokens.Semicolon
  | Tokens.Comma
  | Tokens.Parenthesis
  | Tokens.SquareBracket
  | Tokens.CurlyBracket
  | Tokens.Column

  // Match tokens
  | Tokens.IncludeMatch
  | Tokens.DashMatch
  | Tokens.PrefixMatch
  | Tokens.SuffixMatch
  | Tokens.SubstringMatch;

export const Alphabet: Lang.Alphabet<Token> = new Lang.Alphabet(
  (stream, emit, state, { exit }) => {
    while (true) {
      const token = consumeToken(stream);

      if (token === null) {
        break;
      }

      emit(token);
    }

    return exit;
  },
  () => null
);

/**
 * @see https://www.w3.org/TR/css-syntax/#starts-with-a-valid-escape
 */
function startsValidEscape(fst: number, stream: Stream<number>): boolean {
  if (fst !== Char.ReverseSolidus) {
    return false;
  }

  return stream.peek(1) !== Char.LineFeed;
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
function consumeNumber(char: number, stream: Stream<number>): Tokens.Number {
  const result: Array<number> = [];

  let next: number | null = char;

  let isSigned = false;

  if (next === Char.PlusSign || next === Char.HyphenMinus) {
    result.push(next);
    stream.advance(1);
    next = stream.peek(0);
    isSigned = true;
  }

  while (next !== null && isNumeric(next)) {
    result.push(next);
    stream.advance(1);
    next = stream.peek(0);
  }

  let isInteger = true;

  if (next === Char.FullStop) {
    const char = stream.peek(1);

    if (char !== null && isNumeric(char)) {
      result.push(next, char);
      stream.advance(2);
      next = stream.peek(0);
      isInteger = false;

      while (next !== null && isNumeric(next)) {
        result.push(next);
        stream.advance(1);
        next = stream.peek(0);
      }
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
      next = stream.peek(0);

      while (next !== null && isNumeric(next)) {
        result.push(next);
        stream.advance(1);
        next = stream.peek(0);
      }
    }
  }

  return {
    type: TokenType.Number,
    value: consumeInteger(result),
    integer: isInteger,
    signed: isSigned
  };
}

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-numeric-token
 */
function consumeNumeric(
  char: number,
  stream: Stream<number>
): Tokens.Number | Tokens.Dimension | Tokens.Percentage {
  const number = consumeNumber(char, stream);

  const next = stream.peek(0);

  if (next !== null && startsIdentifier(next, stream)) {
    return {
      type: TokenType.Dimension,
      value: number.value,
      integer: number.integer,
      signed: number.signed,
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
): Tokens.Ident | Tokens.FunctionName | Tokens.Url {
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
): Tokens.String {
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
function consumeUrl(stream: Stream<number>): Tokens.Url {
  let char = stream.next();

  while (char !== null && isWhitespace(char)) {
    char = stream.next();
  }

  if (char === null) {
    return { type: TokenType.Url, value: "" };
  }

  if (char === Char.QuotationMark || char === Char.Apostrophe) {
    const { value } = consumeString(stream, char);

    char = stream.next();

    while (char !== null && isWhitespace(char)) {
      char = stream.next();
    }

    if (char === null) {
      return { type: TokenType.Url, value };
    }

    if (char === Char.RightParenthesis) {
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

const whitespace: Tokens.Whitespace = { type: TokenType.Whitespace };

// CSS uses a fairly limited set of delimiters so there's quite a bit to be
// gained from caching them as they are encoutered. Even in the case that every
// single character in the UTF-16 range is somehow treated as a delimiter, the
// cache won't contain more than 2^16 = 65536 entries, amounting to no more than
// at most a couple of megabytes.
const delims: Map<number, Tokens.Delim> = new Map();

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-token
 */
function consumeToken(stream: Stream<number>): Token | null {
  const char = stream.peek(0);

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

    case Char.NumberSign:
      stream.advance(1);
      const fst = stream.peek(0);

      if (fst !== null) {
        const snd = stream.peek(1);

        if (isName(fst) || (snd !== null && isValidEscape(fst, snd))) {
          return {
            type: TokenType.Hash,
            unrestricted: !startsIdentifier(fst, stream),
            value: consumeName(fst, stream)
          };
        }
      }

      return {
        type: TokenType.Delim,
        value: char
      };
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

  const next = stream.peek(0);

  switch (char) {
    case Char.Tilde:
      if (next === Char.EqualSign) {
        stream.advance(1);
        return {
          type: TokenType.IncludeMatch
        };
      }
      break;

    case Char.VerticalLine:
      switch (next) {
        case Char.EqualSign:
          stream.advance(1);
          return {
            type: TokenType.DashMatch
          };
        case Char.VerticalLine:
          stream.advance(1);
          return {
            type: TokenType.Column
          };
      }
      break;

    case Char.CircumflexAccent:
      if (next === Char.EqualSign) {
        stream.advance(1);
        return {
          type: TokenType.PrefixMatch
        };
      }
      break;

    case Char.DollarSign:
      if (next === Char.EqualSign) {
        stream.advance(1);
        return {
          type: TokenType.SuffixMatch
        };
      }
      break;

    case Char.Asterisk:
      if (next === Char.EqualSign) {
        stream.advance(1);
        return {
          type: TokenType.SubstringMatch
        };
      }
      break;

    case Char.QuotationMark:
    case Char.Apostrophe:
      return consumeString(stream, char);

    case Char.Solidus: {
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
