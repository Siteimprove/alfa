import { Pattern, Command } from "../../../src/types";
import { Alphabet } from "../../../src/alphabet";
import { Char } from "../../../src/char";
import { isWhitespace } from "../../../src/is-whitespace";
import { isNumeric } from "../../../src/is-numeric";

export enum TokenType {
  Number,
  Add,
  Subtract,
  Multiply,
  Divide,
  Exponentiate
}

export type Number = Readonly<{ type: TokenType.Number; value: number }>;
export type Add = Readonly<{ type: TokenType.Add }>;
export type Subtract = Readonly<{ type: TokenType.Subtract }>;
export type Multiply = Readonly<{ type: TokenType.Multiply }>;
export type Divide = Readonly<{ type: TokenType.Divide }>;
export type Exponentiate = Readonly<{ type: TokenType.Exponentiate }>;

export type ExpressionToken =
  | Number
  | Add
  | Subtract
  | Multiply
  | Divide
  | Exponentiate;

export type ExpressionPattern = Pattern<ExpressionToken>;

export function isNumber(token: ExpressionToken): token is Number {
  return token.type === TokenType.Number;
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
      emit({ type: TokenType.Add });
      return;
    case Char.HyphenMinus:
      emit({ type: TokenType.Subtract });
      return;
    case Char.Asterisk:
      emit({ type: TokenType.Multiply });
      return;
    case Char.Solidus:
      emit({ type: TokenType.Divide });
      return;
    case Char.CircumflexAccent:
      emit({ type: TokenType.Exponentiate });
  }
};

const number: ExpressionPattern = (stream, emit) => {
  stream.ignore();
  stream.accept(isNumeric);
  emit({
    type: TokenType.Number,
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
