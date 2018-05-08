import { isWhitespace, isNumeric } from "@alfa/util";
import { Pattern, Location } from "../../../src/types";
import { Alphabet } from "../../../src/alphabet";
import { lex } from "../../../src/lex";

export type Number = { type: "number"; value: number };
export type Plus = { type: "+" };
export type Minus = { type: "-" };
export type Asterix = { type: "*" };
export type Slash = { type: "/" };
export type Caret = { type: "^" };

export type ExpressionToken = Number | Plus | Minus | Asterix | Slash | Caret;

export type ExpressionState = { start: Location };

export type ExpressionPattern = Pattern<ExpressionToken, ExpressionState>;

export function isNumber(token: ExpressionToken): token is Number {
  return token.type === "number" && "value" in token;
}

const initial: ExpressionPattern = (stream, emit, state, done) => {
  stream.accept(isWhitespace);

  state.start = stream.location();

  const char = stream.peek();

  if (char === null) {
    return done();
  }

  if (isNumeric(char)) {
    return number;
  }

  stream.advance();

  switch (char) {
    case "+":
      return plus;
    case "-":
      return minus;
    case "*":
      return asterix;
    case "/":
      return slash;
    case "^":
      return caret;
  }
};

const plus: ExpressionPattern = (stream, emit, { start }) => {
  emit({ type: "+", location: { start, end: stream.location() } });
  return initial;
};

const minus: ExpressionPattern = (stream, emit, { start }) => {
  emit({ type: "-", location: { start, end: stream.location() } });
  return initial;
};

const asterix: ExpressionPattern = (stream, emit, { start }) => {
  emit({ type: "*", location: { start, end: stream.location() } });
  return initial;
};

const slash: ExpressionPattern = (stream, emit, { start }) => {
  emit({ type: "/", location: { start, end: stream.location() } });
  return initial;
};

const caret: ExpressionPattern = (stream, emit, { start }) => {
  emit({ type: "^", location: { start, end: stream.location() } });
  return initial;
};

const number: ExpressionPattern = (stream, emit, { start }) => {
  stream.ignore();
  stream.accept(isNumeric);
  emit({
    type: "number",
    value: Number(stream.result()),
    location: { start, end: stream.location() }
  });
  return initial;
};

export const ExpressionAlphabet: Alphabet<
  ExpressionToken,
  ExpressionState
> = new Alphabet(initial, stream => ({ start: stream.location() }));
