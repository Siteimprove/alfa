import { Pattern, Command } from "../../../src/types";
import { Alphabet } from "../../../src/alphabet";
import { Char } from "../../../src/char";
import { isWhitespace } from "../../../src/is-whitespace";
import { isNumeric } from "../../../src/is-numeric";

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

const initial: ExpressionPattern = stream => {
  stream.accept(isWhitespace);

  const char = stream.peek();

  if (char === null) {
    return Command.End;
  }

  if (isNumeric(char)) {
    return number;
  }

  stream.advance();

  switch (char) {
    case Char.PlusSign:
      return plus;
    case Char.HyphenMinus:
      return minus;
    case Char.Asterisk:
      return asterix;
    case Char.Solidus:
      return slash;
    case Char.CircumflexAccent:
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
  emit({
    type: "number",
    value: stream
      .result()
      .reduce((value, n) => 10 * value + n - Char.DigitZero, 0)
  });
  return initial;
};

export const ExpressionAlphabet: Alphabet<ExpressionToken> = new Alphabet(
  initial,
  () => null
);
