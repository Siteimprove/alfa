import {
  Pattern,
  Alphabet,
  Location,
  WithLocation,
  CharacterStream,
  isWhitespace,
  isAlpha,
  isAlphanumeric,
  isNumeric,
  isAscii,
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
export type Dimension = Readonly<{
  type: "dimension";
  value: number;
  unit: string;
}>;

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

export type CssState = {
  start: Location;
  number: Number | null;
  mark: '"' | "'" | null;
};

export type CssPattern = Pattern<CssToken, CssState>;

export function isIdent(token: CssToken): token is Ident {
  return token.type === "ident";
}

export function isDelim(token: CssToken): token is Delim {
  return token.type === "delim";
}

/**
 * @see https://www.w3.org/TR/css-syntax/#starts-with-a-valid-escape
 */
function startsValidEscape(fst: string, snd: string): boolean {
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
const name: (stream: CharacterStream) => string = ({
  ignore,
  accept,
  result
}) => {
  ignore();
  accept(isName);
  return result();
};

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-token
 */
const initial: CssPattern = (
  { peek, next, accept, advance, backup, location },
  emit,
  state,
  end
) => {
  state.start = location();

  const { start } = state;

  const char = next();

  if (char === null) {
    return end();
  }

  if (isWhitespace(char)) {
    accept(isWhitespace);
    emit({ type: "whitespace", location: { start, end: location() } });
    return;
  }

  switch (char) {
    case '"':
    case "'":
      state.mark = char;
      return string;

    case "(":
    case ")":
      emit({ type: char, location: { start, end: location() } });
      return;
    case "[":
    case "]":
      emit({ type: char, location: { start, end: location() } });
      return;
    case "{":
    case "}":
      emit({ type: char, location: { start, end: location() } });
      return;
    case ",":
      emit({ type: char, location: { start, end: location() } });
      return;
    case ":":
      emit({ type: char, location: { start, end: location() } });
      return;
    case ";":
      emit({ type: char, location: { start, end: location() } });
      return;

    case "/":
      if (peek() === "*") {
        advance();
        return comment;
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

  emit({ type: "delim", value: char, location: { start, end: location() } });
};

const comment: CssPattern = (
  { next, ignore, accept, peek, result, advance, location },
  emit,
  { start }
) => {
  ignore();

  if (accept(() => peek() !== "*" || peek(1) !== "/")) {
    const value = result();
    advance(2);

    // While the CSS syntax specification states that comments should be
    // consumed without emitting a token, we emit one anyway in order to
    // reproduce a complete version of the CSS.
    emit({ type: "comment", value, location: { start, end: location() } });
    return initial;
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
    emit({ type: "function", value, location: { start, end: location() } });
  } else {
    emit({ type: "ident", value, location: { start, end: location() } });
  }

  return initial;
};

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-string-token
 */
const string: CssPattern = (
  { next, ignore, accept, result, advance, location },
  emit,
  { start, mark }
) => {
  ignore();

  if (accept(char => char !== mark)) {
    const value = result();
    advance();
    emit({ type: "string", value, location: { start, end: location() } });
    return initial;
  }
};

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-number
 */
const number: CssPattern = (
  { peek, advance, accept, location, result },
  emit,
  state
) => {
  const { start } = state;

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

    const next = peek(offset);

    if (next !== null && isNumeric(next)) {
      advance(offset) && accept(isNumeric);
    }
  }

  state.number = { type: "number", value: Number(result()) };

  return numeric;
};

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-numeric-token
 */
const numeric: CssPattern = (stream, emit, { start, number }) => {
  const { peek, advance, location } = stream;

  let token: WithLocation<Number | Percentage | Dimension> = {
    type: "number",
    value: number === null ? NaN : number.value,
    location: { start, end: location() }
  };

  const next = peek();

  if (next !== null && startsIdentifier(next, peek(1), peek(2))) {
    token = {
      type: "dimension",
      value: token.value,
      unit: name(stream),
      location: { start, end: location() }
    };
  } else if (peek() === "%" && advance()) {
    token = {
      type: "percentage",
      value: token.value,
      location: { start, end: location() }
    };
  }

  emit(token);
  return initial;
};

export const CssAlphabet: Alphabet<CssToken, CssState> = ({ location }) => [
  initial,
  { start: location(), number: null, mark: null }
];

export function lex(input: string): Array<CssToken> {
  return $lex(input, CssAlphabet);
}
