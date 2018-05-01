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

const initial: ExpressionPattern = (
  { peek, next, accept, advance, location },
  emit,
  state,
  done
) => {
  accept(isWhitespace);

  state.start = location();

  const char = peek();

  if (char === null) {
    return done();
  }

  if (isNumeric(char)) {
    return number;
  }

  advance();

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

const plus: ExpressionPattern = ({ next, location }, emit, { start }) => {
  emit({ type: "+", location: { start, end: location() } });
  return initial;
};

const minus: ExpressionPattern = ({ next, location }, emit, { start }) => {
  emit({ type: "-", location: { start, end: location() } });
  return initial;
};

const asterix: ExpressionPattern = ({ next, location }, emit, { start }) => {
  emit({ type: "*", location: { start, end: location() } });
  return initial;
};

const slash: ExpressionPattern = ({ next, location }, emit, { start }) => {
  emit({ type: "/", location: { start, end: location() } });
  return initial;
};

const caret: ExpressionPattern = ({ next, location }, emit, { start }) => {
  emit({ type: "^", location: { start, end: location() } });
  return initial;
};

const number: ExpressionPattern = (
  { peek, accept, ignore, result, location },
  emit,
  { start }
) => {
  ignore();
  accept(isNumeric);
  emit({
    type: "number",
    value: Number(result()),
    location: { start, end: location() }
  });
  return initial;
};

export const ExpressionAlphabet: Alphabet<
  ExpressionToken,
  ExpressionState
> = new Alphabet(initial, stream => ({ start: stream.location() }));
