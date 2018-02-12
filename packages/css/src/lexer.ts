import {
  Pattern,
  Alphabet,
  Location,
  CharacterStream,
  isWhitespace,
  isAlpha,
  isAlphanumeric,
  isNumeric,
  isNonAscii,
  lex as $lex
} from "@alfa/lang";

export type Whitespace = Readonly<{ type: "whitespace" }>;

export type Comment = Readonly<{ type: "comment"; value: string }>;

export type Ident = Readonly<{ type: "ident"; value: string }>;
export type Function = Readonly<{ type: "function"; value: string }>;
export type String = Readonly<{ type: "string"; value: string }>;
export type Url = Readonly<{ type: "url"; value: string }>;
export type Delim = Readonly<{ type: "delim"; value: string }>;
export type Number = Readonly<{ type: "number"; value: number }>;
export type Percentage = Readonly<{ type: "percentage"; value: number }>;
export type Dimension = Readonly<{ type: "dimension"; value: number }>;

export type Colon = Readonly<{ type: ":" }>;
export type Semicolon = Readonly<{ type: ";" }>;
export type Comma = Readonly<{ type: "," }>;
export type Bracket = Readonly<{ type: "[" | "]" }>;
export type Paren = Readonly<{ type: "(" | ")" }>;
export type Brace = Readonly<{ type: "{" | "}" }>;

/**
 * @see https://www.w3.org/TR/css-syntax/#tokenization
 */
export type CssToken =
  | Whitespace
  | Comment

  // Value tokens
  | Ident
  | Function
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

export function isIdent(token: CssToken | null): token is Ident {
  return token !== null && token.type === "ident";
}

export function isDelim(token: CssToken | null): token is Delim {
  return token !== null && token.type === "delim";
}

export type CssPattern = Pattern<CssToken>;

/**
 * @see https://www.w3.org/TR/css-syntax/#starts-with-a-valid-escape
 */
function startsValidEscape(fst: string | null, snd: string | null): boolean {
  return fst === "\\" && snd !== "\n";
}

/**
 * @see https://www.w3.org/TR/css-syntax/#starts-with-a-number
 */
function startsNumber(
  fst: string | null,
  snd: string | null,
  thd: string | null
): boolean {
  if (fst === "+" || fst === "-") {
    if (snd === ".") {
      return isNumeric(thd);
    }

    return isNumeric(snd);
  }

  if (fst === ".") {
    return isNumeric(snd);
  }

  return isNumeric(fst);
}

/**
 * @see https://www.w3.org/TR/css-syntax/#would-start-an-identifier
 */
function startsIdentifier(
  fst: string | null,
  snd: string | null,
  thd: string | null
): boolean {
  if (fst === "-") {
    fst = snd;
    snd = thd;
  }

  return isNameStart(fst) || startsValidEscape(fst, snd);
}

/**
 * @see https://www.w3.org/TR/css-syntax/#name-start-code-point
 */
function isNameStart(char: string | null): boolean {
  return isAlpha(char) || isNonAscii(char) || char === "_";
}

/**
 * @see https://www.w3.org/TR/css-syntax/#name-code-point
 */
function isName(char: string | null): boolean {
  return isNameStart(char) || isNumeric(char) || char === "-";
}

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-name
 */
const name: (stream: CharacterStream) => string = ({ accept, result }) => {
  accept(char => isName(char));
  return result();
};

const comment: (start: Location) => CssPattern = start => (
  { next, ignore, accept, peek, result, advance, location },
  emit
) => {
  ignore();

  if (accept(() => peek() !== "*" || peek(1) !== "/")) {
    const value = result();
    advance(2);

    // While the CSS syntax specification states that comments should be
    // consumed without emitting a token, we emit one anyway in order to
    // reproduce a complete version of the CSS.
    emit({ type: "comment", value }, start, location());
    return data;
  }
};

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-an-ident-like-token
 */
const ident: CssPattern = (stream, emit) => {
  const { peek, advance, location } = stream;
  const start = location();
  const value = name(stream);

  if (peek() === "(") {
    advance();
    emit({ type: "function", value }, start, location());
  } else {
    emit({ type: "ident", value }, start, location());
  }

  return data;
};

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-string-token
 */
const string: (start: Location, mark: '"' | "'") => CssPattern = (
  start,
  mark
) => ({ next, ignore, accept, result, advance, location }, emit) => {
  ignore();

  if (accept(char => char !== mark)) {
    const value = result();
    advance();
    emit({ type: "string", value }, start, location());
    return data;
  }
};

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-number
 */
const number: CssPattern = (
  { peek, advance, accept, location, result },
  emit
) => {
  const start = location();

  if (peek() === "+" || peek() === "-") {
    advance();
  }

  const isInteger = accept(isNumeric) && peek() !== ".";
  const isDecimal = peek() === "." && advance() && accept(isNumeric);

  if (!isInteger && !isDecimal) {
    return;
  }

  if (peek() === "E" || peek() === "e") {
    let offset = 1;

    if (peek(1) === "-" || peek(1) === "+") {
      offset = 2;
    }

    if (isNumeric(peek(offset))) {
      advance(offset) && accept(isNumeric);
    }
  }

  const number: Number = { type: "number", value: Number(result()) };

  if (peek() === null) {
    emit(number, start, location());
  } else {
    return numeric(start, number);
  }
};

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-numeric-token
 */
const numeric: (start: Location, number: Number) => CssPattern = (
  start,
  number
) => ({ peek, location }, emit) => {
  // if (startsIdentifier(peek(), peek(1), peek(2))) {
  //
  // }
  emit(number, start, location());
  return data;
};

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-token
 */
const data: CssPattern = (
  { peek, next, accept, advance, backup, location },
  emit
) => {
  const start = location();
  const char = next();

  if (isWhitespace(char)) {
    accept(isWhitespace);
    emit({ type: "whitespace" }, start, location());
    return;
  }

  switch (char) {
    case '"':
    case "'":
      return string(start, char);

    case "(":
    case ")":
      emit({ type: char }, start, location());
      return;
    case "[":
    case "]":
      emit({ type: char }, start, location());
      return;
    case "{":
    case "}":
      emit({ type: char }, start, location());
      return;
    case ",":
      emit({ type: char }, start, location());
      return;
    case ":":
      emit({ type: char }, start, location());
      return;
    case ";":
      emit({ type: char }, start, location());
      return;

    case "/":
      if (peek() === "*") {
        advance();
        return comment(start);
      }
  }

  if (startsNumber(char, peek(), peek(1))) {
    backup();
    return number;
  }

  if (startsIdentifier(char, peek(), peek(1))) {
    backup();
    return ident;
  }

  if (char !== null) {
    emit({ type: "delim", value: char }, start, location());
  }
};

export const CssAlphabet: Alphabet<CssToken> = () => data;

export function lex(input: string): Array<CssToken> {
  return $lex(input, CssAlphabet);
}
