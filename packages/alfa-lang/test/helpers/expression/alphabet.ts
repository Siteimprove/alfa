import { isWhitespace, isNumeric } from "@siteimprove/alfa-util";
import { Pattern } from "../../../src/types";
import { Alphabet } from "../../../src/alphabet";
import { lex } from "../../../src/lex";

export type Number = { type: "number"; value: number };
export type Plus = { type: "+" };
export type Minus = { type: "-" };
export type Asterix = { type: "*" };
export type Slash = { type: "/" };
export type Caret = { type: "^" };

export type ExpressionToken = Number | Plus | Minus | Asterix | Slash | Caret;

export type ExpressionPattern = Pattern<ExpressionToken>;

export function isNumber(token: ExpressionToken): token is Number {
  return token.type === "number" && "value" in token;
}

const initial: ExpressionPattern = (stream, emit, state, done) => {
  stream.accept(isWhitespace);

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

const plus: ExpressionPattern = (stream, emit) => {
  emit({ type: "+" });
  return initial;
};

const minus: ExpressionPattern = (stream, emit) => {
  emit({ type: "-" });
  return initial;
};

const asterix: ExpressionPattern = (stream, emit) => {
  emit({ type: "*" });
  return initial;
};

const slash: ExpressionPattern = (stream, emit) => {
  emit({ type: "/" });
  return initial;
};

const caret: ExpressionPattern = (stream, emit) => {
  emit({ type: "^" });
  return initial;
};

const number: ExpressionPattern = (stream, emit) => {
  stream.ignore();
  stream.accept(isNumeric);
  emit({ type: "number", value: parseFloat(stream.result().join("")) });
  return initial;
};

export const ExpressionAlphabet: Alphabet<ExpressionToken> = new Alphabet(
  initial,
  () => null
);
