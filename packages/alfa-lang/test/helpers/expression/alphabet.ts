import { Pattern, Command } from "../../../src/types";
import { Alphabet } from "../../../src/alphabet";
import { Char } from "../../../src/char";
import { isWhitespace } from "../../../src/is-whitespace";
import { isNumeric } from "../../../src/is-numeric";

export type Number = Readonly<{ type: "number"; value: number }>;
export type Add = "+";
export type Subtract = "-";
export type Multiply = "*";
export type Divide = "/";
export type Exponentiate = "^";

export type ExpressionToken =
  | Number
  | Add
  | Subtract
  | Multiply
  | Divide
  | Exponentiate;

export type ExpressionPattern = Pattern<ExpressionToken>;

export function isNumber(token: ExpressionToken): token is Number {
  return typeof token === "object" && token.type === "number";
}

const initial: ExpressionPattern = (stream, emit) => {
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
      emit("+");
      return;
    case Char.HyphenMinus:
      emit("-");
      return;
    case Char.Asterisk:
      emit("*");
      return;
    case Char.Solidus:
      emit("/");
      return;
    case Char.CircumflexAccent:
      emit("^");
  }
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
