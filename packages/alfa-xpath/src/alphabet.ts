import * as Lang from "@siteimprove/alfa-lang";
import {
  Char,
  isAlpha,
  isBetween,
  isNumeric,
  Stream
} from "@siteimprove/alfa-lang";

const { fromCharCode } = String;
const { pow } = Math;

export enum TokenType {
  Integer,
  Decimal,
  Double,
  String,
  Comment,
  Name,
  Character
}

export namespace Tokens {
  interface Token<T extends TokenType> extends Lang.Token<T> {}

  export interface Integer extends Token<TokenType.Integer> {
    value: number;
  }

  export interface Decimal extends Token<TokenType.Decimal> {
    value: number;
  }

  export interface Double extends Token<TokenType.Double> {
    value: number;
  }

  export interface String extends Token<TokenType.String> {
    value: string;
  }

  export interface Comment extends Token<TokenType.Comment> {
    value: string;
  }

  export interface Name extends Token<TokenType.Name> {
    prefix?: string;
    value: string;
  }

  export interface Character extends Token<TokenType.Character> {
    value: number;
  }
}

/**
 * @see https://www.w3.org/TR/xpath-31/#terminal-symbols
 */
export type Token =
  | Tokens.Integer
  | Tokens.Decimal
  | Tokens.Double
  | Tokens.String
  | Tokens.Comment
  | Tokens.Name
  | Tokens.Character;

type Pattern = Lang.Pattern<Token>;

const initial: Pattern = (stream, emit, state, { exit }) => {
  const next = stream.peek(0);

  if (next === null) {
    return exit;
  }

  if (isNumeric(next)) {
    return numeric;
  }

  if (next !== Char.Colon && isNameStart(next)) {
    return name;
  }

  switch (next) {
    case Char.QuotationMark:
    case Char.Apostrophe:
      return string;

    case Char.LeftParenthesis:
      if (stream.peek(1) === Char.Colon) {
        stream.advance(2);
        return comment;
      }
      break;

    case Char.FullStop: {
      const next = stream.peek(1);

      if (next !== null && isNumeric(next)) {
        return numeric;
      }
    }
  }

  if (isCharacter(next)) {
    stream.advance(1);
    emit({ type: TokenType.Character, value: next });
    return initial;
  }

  return exit;
};

const numeric: Pattern = (stream, emit) => {
  let type = TokenType.Integer;
  let value = 0;
  let next = stream.peek(0);

  while (next !== null && isNumeric(next)) {
    value = value * 10 + next - Char.DigitZero;

    stream.advance(1);
    next = stream.peek(0);
  }

  if (next === Char.FullStop) {
    type = TokenType.Decimal;

    stream.advance(1);
    next = stream.peek(0);

    let fraction = 0;
    let digits = 0;

    while (next !== null && isNumeric(next)) {
      fraction = fraction * 10 + next - Char.DigitZero;
      digits++;

      stream.advance(1);
      next = stream.peek(0);
    }

    value = value + fraction / pow(10, digits);
  }

  if (next === Char.SmallLetterE || next === Char.CapitalLetterE) {
    type = TokenType.Double;

    stream.advance(1);
    next = stream.peek(0);

    let exponent = 0;
    let sign = -1;

    if (
      next !== null &&
      (next === Char.HyphenMinus || next === Char.PlusSign)
    ) {
      if (next === Char.HyphenMinus) {
        sign = 1;
      }

      stream.advance(1);
      next = stream.peek(0);
    }

    while (next !== null && isNumeric(next)) {
      exponent = exponent * 10 + next - Char.DigitZero;

      stream.advance(1);
      next = stream.peek(0);
    }

    value = value / pow(10, sign * exponent);
  }

  switch (type) {
    case TokenType.Integer:
      emit({ type, value });
      break;
    case TokenType.Decimal:
      emit({ type, value });
      break;
    case TokenType.Double:
      emit({ type, value });
  }

  return initial;
};

const string: Pattern = (stream, emit) => {
  const mark = stream.next()!;
  const result: Array<number> = [];

  let next = stream.peek(0);

  while (next !== null) {
    if (next === mark) {
      stream.advance(1);
      next = stream.peek(0);

      if (next === mark) {
        result.push(mark);

        stream.advance(1);
        next = stream.peek(0);

        continue;
      }

      break;
    }

    result.push(next);

    stream.advance(1);
    next = stream.peek(0);
  }

  emit({ type: TokenType.String, value: fromCharCode(...result) });

  return initial;
};

const comment: Pattern = (stream, emit) => {
  let contents = commentContents(stream);

  const n = contents.length;

  if (
    contents[n - 2] === Char.Colon &&
    contents[n - 1] === Char.RightParenthesis
  ) {
    contents = contents.slice(0, n - 2);
  }

  emit({ type: TokenType.Comment, value: fromCharCode(...contents) });

  return initial;
};

function commentContents(stream: Stream<number>): Array<number> {
  const result: Array<number> = [];

  let next = stream.peek(0);

  while (next !== null) {
    switch (next) {
      case Char.LeftParenthesis:
        stream.advance(1);
        result.push(next);
        next = stream.peek(0);

        if (next === Char.Colon) {
          stream.advance(1);
          result.push(next, ...commentContents(stream));
          next = stream.peek(0);
          continue;
        }
        break;

      case Char.Colon:
        stream.advance(1);
        result.push(next);
        next = stream.peek(0);

        if (next === Char.RightParenthesis) {
          stream.advance(1);
          result.push(next);
          return result;
        }
        break;

      default:
        stream.advance(1);
        result.push(next);
        next = stream.peek(0);
    }
  }

  return result;
}

const name: Pattern = (stream, emit) => {
  let result: Array<number> = [];

  stream.accept(isNonColonName, result);

  let name: Tokens.Name = {
    type: TokenType.Name,
    value: fromCharCode(...result)
  };

  if (stream.peek(0) === Char.Colon) {
    const next = stream.peek(1);

    if (next !== null && next !== Char.Colon && isNameStart(next)) {
      const prefix = fromCharCode(...result);
      result = [];

      stream.advance(1);
      stream.accept(isNonColonName, result);

      name = { type: TokenType.Name, prefix, value: fromCharCode(...result) };
    }
  }

  emit(name);

  return initial;
};

export const Alphabet: Lang.Alphabet<Token> = new Lang.Alphabet(
  initial,
  () => null
);

/**
 * @see https://www.w3.org/TR/xml/#NT-NameStartChar
 */
function isNameStart(char: number): boolean {
  return (
    char === Char.Colon ||
    char === Char.LowLine ||
    isAlpha(char) ||
    isBetween(char, 0xc0, 0xd6) ||
    isBetween(char, 0xd8, 0xf6) ||
    isBetween(char, 0xf8, 0x2ff) ||
    isBetween(char, 0x370, 0x37d) ||
    isBetween(char, 0x37f, 0x1fff) ||
    isBetween(char, 0x200c, 0x200d) ||
    isBetween(char, 0x2070, 0x218f) ||
    isBetween(char, 0x2c00, 0x2fef) ||
    isBetween(char, 0x3001, 0xd7ff) ||
    isBetween(char, 0xf900, 0xfdcf) ||
    isBetween(char, 0xfdf0, 0xfffd) ||
    isBetween(char, 0x10000, 0xeffff)
  );
}

/**
 * @see https://www.w3.org/TR/xml/#NT-NameChar
 */
function isName(char: number): boolean {
  return (
    char === Char.HyphenMinus ||
    char === Char.FullStop ||
    char === 0xb7 ||
    isNameStart(char) ||
    isNumeric(char) ||
    isBetween(char, 0x0300, 0x036f) ||
    isBetween(char, 0x203f, 0x2040)
  );
}

/**
 * @see https://www.w3.org/TR/xml-names/#NT-NCName
 */
function isNonColonName(char: number): boolean {
  return char !== Char.Colon && isName(char);
}

/**
 * @see https://www.w3.org/TR/xml/#NT-Char
 */
function isCharacter(char: number): boolean {
  return (
    char === 0x9 ||
    char === 0xa ||
    char === 0xd ||
    isBetween(char, 0x20, 0xd7ff) ||
    isBetween(char, 0xe000, 0xfffd) ||
    isBetween(char, 0x10000, 0x10ffff)
  );
}
