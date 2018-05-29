import * as Lang from "@siteimprove/alfa-lang";
import {
  Stream,
  Command,
  Char,
  isWhitespace,
  isAlpha,
  isAlphanumeric,
  isBetween,
  isHex,
  isNumeric,
  isAscii
} from "@siteimprove/alfa-lang";

const { fromCharCode } = String;

export type Whitespace = Readonly<{ type: "whitespace" }>;

export type Ident = Readonly<{ type: "ident"; value: string }>;
export type FunctionName = Readonly<{ type: "function-name"; value: string }>;
export type String = Readonly<{ type: "string"; value: string }>;
export type Url = Readonly<{ type: "url"; value: string }>;
export type Delim = Readonly<{ type: "delim"; value: string }>;
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
  | Whitespace

  // Value tokens
  | Ident
  | FunctionName
  | String
  | Url
  | Delim
  | Number
  | Percentage
  | Dimension

  // Character tokens
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

export function isIdent(token: Token): token is Ident {
  return token.type === "ident";
}

export function isFunctionName(token: Token): token is FunctionName {
  return token.type === "function-name";
}

export function isString(token: Token): token is String {
  return token.type === "string";
}

export function isDelim(token: Token): token is Delim {
  return token.type === "delim";
}

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
const name: (stream: Stream<number>) => string = stream => {
  let result = "";
  let next = stream.next();

  while (next !== null) {
    if (startsValidEscape(next, stream.peek())) {
      result += escapedCodePoint(stream);
    } else if (isName(next)) {
      result += fromCharCode(next);
    } else {
      stream.backup();
      return result;
    }

    next = stream.next();
  }

  return result;
};

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-an-escaped-code-point
 */
const escapedCodePoint: (stream: Stream<number>) => string = stream => {
  let code = stream.next();

  if (code === null) {
    return "\ufffd";
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

    if (code === 0) {
      return "\ufffd";
    }
  }

  return fromCharCode(code);
};

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
      if (stream.peek() === Char.Asterisk) {
        stream.advance();
        return comment;
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

  emit({ type: "delim", value: fromCharCode(char) });
};

const comment: Pattern = (stream, emit, state) => {
  stream.ignore();

  if (
    stream.accept(
      () => stream.peek() !== Char.Asterisk || stream.peek(1) !== Char.Solidus
    )
  ) {
    const value = fromCharCode(...stream.result());
    stream.advance(2);
    return initial;
  }
};

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-an-ident-like-token
 */
const ident: Pattern = (stream, emit) => {
  const value = name(stream);

  if (stream.peek() === Char.LeftParenthesis) {
    stream.advance();
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

  if (
    stream.peek() === Char.SmallLetterE ||
    stream.peek() === Char.CapitalLetterE
  ) {
    let offset = 1;

    if (
      stream.peek(1) === Char.PlusSign ||
      stream.peek(1) === Char.HyphenMinus
    ) {
      offset = 2;
    }

    const next = stream.peek(offset);

    if (next !== null && isNumeric(next)) {
      stream.advance(offset) && stream.accept(isNumeric);
    }
  }

  const value = fromCharCode(...stream.result());

  state.number = {
    type: "number",
    value: isInteger ? parseInt(value, 10) : parseFloat(value),
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
