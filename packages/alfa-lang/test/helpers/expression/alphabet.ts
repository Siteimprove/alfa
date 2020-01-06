import * as Lang from "../../../src";
import { Char } from "../../../src/char";
import { isNumeric } from "../../../src/is-numeric";
import { isWhitespace } from "../../../src/is-whitespace";

const { fromCharCode } = String;

export enum TokenType {
  Number,
  Add,
  Subtract,
  Multiply,
  Divide,
  Exponentiate
}

export namespace Tokens {
  interface Token<T extends TokenType> extends Lang.Token<T> {}

  export interface Number extends Token<TokenType.Number> {
    readonly value: number;
  }

  export interface Add extends Token<TokenType.Add> {}

  export interface Subtract extends Token<TokenType.Subtract> {}

  export interface Multiply extends Token<TokenType.Multiply> {}

  export interface Divide extends Token<TokenType.Divide> {}

  export interface Exponentiate extends Token<TokenType.Exponentiate> {}
}

export type Token =
  | Tokens.Number
  | Tokens.Add
  | Tokens.Subtract
  | Tokens.Multiply
  | Tokens.Divide
  | Tokens.Exponentiate;

export type Pattern = Lang.Pattern<Token>;

export function isNumber(token: Token): token is Tokens.Number {
  return token.type === TokenType.Number;
}

const initial: Pattern = (stream, emit, state, { exit }) => {
  stream.accept(isWhitespace);

  const char = stream.peek(0);

  if (char === null) {
    return exit;
  }

  return isNumeric(char) ? constant : operator;
};

const constant: Pattern = (stream, emit) => {
  const result: Array<number> = [];

  stream.accept(isNumeric, result);

  emit({
    type: TokenType.Number,
    value: result.reduce((value, char) => 10 * value + char - Char.DigitZero, 0)
  });

  return initial;
};

const operator: Pattern = (stream, emit) => {
  const char = stream.next()!;

  switch (char) {
    case Char.PlusSign:
      emit({ type: TokenType.Add });
      break;
    case Char.HyphenMinus:
      emit({ type: TokenType.Subtract });
      break;
    case Char.Asterisk:
      emit({ type: TokenType.Multiply });
      break;
    case Char.Solidus:
      emit({ type: TokenType.Divide });
      break;
    case Char.CircumflexAccent:
      emit({ type: TokenType.Exponentiate });
      break;
    default:
      throw new Error(`Unknown operator: ${fromCharCode(char)}`);
  }

  return initial;
};

export const Alphabet: Lang.Alphabet<Token> = new Lang.Alphabet(
  initial,
  () => null
);
