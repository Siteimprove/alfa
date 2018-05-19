import * as Lang from "@siteimprove/alfa-lang";
import { Stream, Command } from "@siteimprove/alfa-lang";
import {
  isWhitespace,
  isAlpha,
  isAlphanumeric,
  isHex,
  isNumeric,
  isAscii
} from "@siteimprove/alfa-util";

export type Whitespace = Readonly<{ type: "whitespace" }>;

export type Comment = Readonly<{ type: "comment"; value: string }>;

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
  | Comment

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
  mark: '"' | "'" | null;
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
function startsValidEscape(fst: string, snd: string | null): boolean {
  return fst === "\\" && snd !== "\n";
}

/**
 * @see https://www.w3.org/TR/css-syntax/#starts-with-a-number
 */
function startsNumber(
  fst: string,
  snd: string | null,
  thd: string | null
): boolean {
  if (fst === "+" || fst === "-") {
    if (snd === ".") {
      if (thd !== null) {
        fst = thd;
      }
    } else {
      if (snd !== null) {
        fst = snd;
      }
    }
  }

  if (fst === ".") {
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
  fst: string,
  snd: string | null,
  thd: string | null
): boolean {
  if (fst === "-") {
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
function isNameStart(char: string): boolean {
  return isAlpha(char) || !isAscii(char) || char === "_";
}

/**
 * @see https://www.w3.org/TR/css-syntax/#name-code-point
 */
function isName(char: string): boolean {
  return isNameStart(char) || isNumeric(char) || char === "-";
}

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-name
 */
const name: (stream: Stream<string>) => string = stream => {
  let result = "";
  let next = stream.next();

  while (next !== null) {
    if (startsValidEscape(next, stream.peek())) {
      result += escapedCodePoint(stream);
    } else if (isName(next)) {
      result += next;
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
const escapedCodePoint: (stream: Stream<string>) => string = stream => {
  let next = stream.next();

  if (next === null) {
    return "\ufffd";
  }

  if (isHex(next)) {
    const hex = stream.accept(isHex, 0, 5);

    stream.accept(isWhitespace, 1);

    const code = parseInt(next + (hex === false ? "" : hex.join("")), 16);

    if (code === 0) {
      return "\ufffd";
    }

    return String.fromCharCode(code);
  }

  return next;
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
    case '"':
    case "'":
      state.mark = char;
      return string;

    case "(":
    case ")":
      emit({ type: char });
      return;
    case "[":
    case "]":
      emit({ type: char });
      return;
    case "{":
    case "}":
      emit({ type: char });
      return;
    case ",":
      emit({ type: char });
      return;
    case ":":
      emit({ type: char });
      return;
    case ";":
      emit({ type: char });
      return;

    case "/":
      if (stream.peek() === "*") {
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

  emit({ type: "delim", value: char });
};

const comment: Pattern = (stream, emit, state) => {
  stream.ignore();

  if (stream.accept(() => stream.peek() !== "*" || stream.peek(1) !== "/")) {
    const value = stream.result().join("");
    stream.advance(2);

    // While the CSS syntax specification states that comments should be
    // consumed without emitting a token, we emit one anyway in order to
    // reproduce a complete version of the CSS.
    emit({ type: "comment", value });
    return initial;
  }
};

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-an-ident-like-token
 */
const ident: Pattern = (stream, emit) => {
  const value = name(stream);

  if (stream.peek() === "(") {
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
    const value = stream.result().join("");
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

  if (stream.peek() === "+" || stream.peek() === "-") {
    stream.advance();
  }

  const isInteger = stream.accept(isNumeric) !== false && stream.peek() !== ".";
  const isDecimal =
    stream.peek() === "." &&
    stream.advance() !== false &&
    stream.accept(isNumeric) !== false;

  if (!isInteger && !isDecimal) {
    return;
  }

  if (stream.peek() === "E" || stream.peek() === "e") {
    let offset = 1;

    if (stream.peek(1) === "-" || stream.peek(1) === "+") {
      offset = 2;
    }

    const next = stream.peek(offset);

    if (next !== null && isNumeric(next)) {
      stream.advance(offset) && stream.accept(isNumeric);
    }
  }

  const value = stream.result().join("");

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
  } else if (stream.peek() === "%" && stream.advance()) {
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
