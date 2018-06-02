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

export type Ident = Readonly<{ type: "ident"; value: string }>;

export type FunctionName = Readonly<{ type: "function-name"; value: string }>;

export type AtKeyword = Readonly<{ type: "at-keyword"; value: string }>;

export type String = Readonly<{ type: "string"; value: string }>;

export type Url = Readonly<{ type: "url"; value: string }>;

export type Delim = Readonly<{ type: "delim"; value: number }>;

export type Number = Readonly<{
  type: "number";
  value: number;
  integer: boolean;
}>;

export type Percentage = Readonly<{
  type: "percentage";
  value: number;
  integer: boolean;
}>;

export type Dimension = Readonly<{
  type: "dimension";
  value: number;
  integer: boolean;
  unit: string;
}>;

export type Whitespace = Readonly<{ type: "whitespace" }>;

export type Colon = Readonly<{ type: ":" }>;

export type Semicolon = Readonly<{ type: ";" }>;

export type Comma = Readonly<{ type: "," }>;

export type Bracket<Type extends "[" | "]" = "[" | "]"> = Readonly<{
  type: Type;
}>;

export type Paren<Type extends "(" | ")" = "(" | ")"> = Readonly<{
  type: Type;
}>;

export type Brace<Type extends "{" | "}" = "{" | "}"> = Readonly<{
  type: Type;
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
  | Bracket
  | Paren
  | Brace;

export type State = {
  number: Number | null;
  mark: Char.QuotationMark | Char.Apostrophe | null;
};

export type Pattern = Lang.Pattern<Token, State>;

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
function name(stream: Stream<number>): string {
  let result = "";
  let next = stream.next();

  while (next !== null) {
    if (startsValidEscape(next, stream.peek())) {
      result += fromCharCode(escapedCodePoint(stream));
    } else if (isName(next)) {
      result += fromCharCode(next);
    } else {
      stream.backup();
      break;
    }

    next = stream.next();
  }

  return result;
}

const replacementCharacter = 0xfffd;

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-an-escaped-code-point
 */
function escapedCodePoint(stream: Stream<number>): number {
  let code = stream.next();

  if (code === null) {
    return replacementCharacter;
  }

  if (isHex(code)) {
    const bytes = [code, ...(stream.accept(isHex, 0, 5) || [])];

    for (let i = 0, n = bytes.length; i < n; i++) {
      let byte = bytes[i];

      if (isNumeric(byte)) {
        byte = byte - Char.DigitZero;
      }

      if (isBetween(byte, Char.SmallLetterA, Char.SmallLetterF)) {
        byte = byte - Char.SmallLetterA + 10;
      }

      if (isBetween(byte, Char.CapitalLetterA, Char.CapitalLetterF)) {
        byte = byte - Char.CapitalLetterA + 10;
      }

      code = 0x10 * code + byte;
    }

    stream.accept(isWhitespace, 1);

    if (code === 0 || isBetween(code, 0xd800, 0xdfff) || code > 0x10ffff) {
      return replacementCharacter;
    }
  }

  return code;
}

/**
 * @see https://www.w3.org/TR/css-syntax/#convert-a-string-to-a-number
 */
function integer(input: Array<number>): number {
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
      return fraction(input, i + 1, result) * sign;
    }

    if (char === Char.SmallLetterE || char === Char.CapitalLetterE) {
      return exponent(input, i + 1, result) * sign;
    }

    result = result * 10 + char - Char.DigitZero;
  }

  return result * sign;
}

/**
 * @see https://www.w3.org/TR/css-syntax/#convert-a-string-to-a-number
 */
function fraction(input: Array<number>, start: number, result: number): number {
  let power = 0.1;

  for (let i = start, n = input.length; i < n; i++, power /= 10) {
    const char = input[i];

    if (char === Char.SmallLetterE || char === Char.CapitalLetterE) {
      return exponent(input, i + 1, result);
    }

    result = result + power * (char - Char.DigitZero);
  }

  return result;
}

/**
 * @see https://www.w3.org/TR/css-syntax/#convert-a-string-to-a-number
 */
function exponent(input: Array<number>, start: number, result: number): number {
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
 * @see https://www.w3.org/TR/css-syntax/#consume-a-token
 */
const initial: Pattern = (stream, emit, state) => {
  const char = stream.next();

  if (char === null) {
    return Command.End;
  }

  if (isWhitespace(char)) {
    stream.accept(isWhitespace);
    emit({ type: "whitespace" });
    return;
  }

  switch (char) {
    case Char.QuotationMark:
    case Char.Apostrophe:
      state.mark = char;
      return string;

    case Char.LeftParenthesis:
      emit({ type: "(" });
      return;
    case Char.RightParenthesis:
      emit({ type: ")" });
      return;
    case Char.LeftSquareBracket:
      emit({ type: "[" });
      return;
    case Char.RightSquareBracket:
      emit({ type: "]" });
      return;
    case Char.LeftCurlyBracket:
      emit({ type: "{" });
      return;
    case Char.RightCurlyBracket:
      emit({ type: "}" });
      return;
    case Char.Comma:
      emit({ type: "," });
      return;
    case Char.Colon:
      emit({ type: ":" });
      return;
    case Char.Semicolon:
      emit({ type: ";" });
      return;

    case Char.Solidus:
      if (stream.accept(char => char === Char.Asterisk, 1)) {
        return comment;
      }
      break;

    case Char.AtSign: {
      const char = stream.peek();

      if (
        char !== null &&
        startsIdentifier(char, stream.peek(1), stream.peek(2))
      ) {
        emit({ type: "at-keyword", value: name(stream) });
        return;
      }
    }
  }

  const snd = stream.peek();
  const thd = stream.peek(1);

  if (startsIdentifier(char, snd, thd)) {
    stream.backup();
    return ident;
  }

  if (startsNumber(char, snd, thd)) {
    stream.backup();
    return number;
  }

  emit({ type: "delim", value: char });
};

const comment: Pattern = (stream, emit, state) => {
  stream.ignore();

  if (
    stream.accept(
      () => stream.peek() !== Char.Asterisk || stream.peek(1) !== Char.Solidus
    )
  ) {
    stream.advance(2);
    return initial;
  }
};

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-an-ident-like-token
 */
const ident: Pattern = (stream, emit) => {
  const value = name(stream);

  if (stream.accept(char => char === Char.LeftParenthesis, 1)) {
    emit({ type: "function-name", value });
  } else {
    emit({ type: "ident", value });
  }

  return initial;
};

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-string-token
 */
const string: Pattern = (stream, emit, state) => {
  stream.ignore();

  if (stream.accept(char => char !== state.mark)) {
    const value = fromCharCode(...stream.result());
    stream.advance();
    emit({ type: "string", value });
    return initial;
  }
};

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-number
 */
const number: Pattern = (stream, emit, state) => {
  stream.ignore();

  if (stream.peek() === Char.PlusSign || stream.peek() === Char.HyphenMinus) {
    stream.advance();
  }

  const isInteger =
    stream.accept(isNumeric) !== false && stream.peek() !== Char.FullStop;

  const isDecimal =
    stream.peek() === Char.FullStop &&
    stream.advance() !== false &&
    stream.accept(isNumeric) !== false;

  if (!isInteger && !isDecimal) {
    return;
  }

  let next = stream.peek();
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

  state.number = {
    type: "number",
    value: integer(stream.result()),
    integer: isInteger
  };

  return numeric;
};

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-numeric-token
 */
const numeric: Pattern = (stream, emit, state) => {
  let token: Number | Percentage | Dimension = {
    type: "number",
    value: state.number === null ? NaN : state.number.value,
    integer: state.number === null ? true : state.number.integer
  };

  const next = stream.peek();

  if (next !== null && startsIdentifier(next, stream.peek(1), stream.peek(2))) {
    token = {
      type: "dimension",
      value: token.value,
      integer: token.integer,
      unit: name(stream)
    };
  } else if (stream.peek() === Char.PercentSign && stream.advance()) {
    token = {
      type: "percentage",
      value: token.value / 100,
      integer: token.integer
    };
  }

  emit(token);
  return initial;
};

export const Alphabet: Lang.Alphabet<Token, State> = new Lang.Alphabet(
  initial,
  () => ({ number: null, mark: null })
);
