import { Pattern, Alphabet, lex, isNumeric, isWhitespace } from "../../../src/lexer";

export type Number = { type: "number"; value: number };
export type Plus = { type: "+" };
export type Minus = { type: "-" };
export type Asterix = { type: "*" };
export type Slash = { type: "/" };
export type Caret = { type: "^" };

export type ExpressionToken = Number | Plus | Minus | Asterix | Slash | Caret;

export type ExpressionPattern<T extends ExpressionToken> = Pattern<
  ExpressionToken,
  T
>;

export function isNumber(token: ExpressionToken): token is Number {
  return token.type === "number" && "value" in token;
}

const plus: ExpressionPattern<Plus> = ({ next }, emit) => {
  if (next() === "+") {
    emit({ type: "+" });
  }
};

const minus: ExpressionPattern<Minus> = ({ next }, emit) => {
  if (next() === "-") {
    emit({ type: "-" });
  }
};

const asterix: ExpressionPattern<Asterix> = ({ next }, emit) => {
  if (next() === "*") {
    emit({ type: "*" });
  }
};

const slash: ExpressionPattern<Slash> = ({ next }, emit) => {
  if (next() === "/") {
    emit({ type: "/" });
  }
};

const caret: ExpressionPattern<Caret> = ({ next }, emit) => {
  if (next() === "^") {
    emit({ type: "^" });
  }
};

const number: ExpressionPattern<Number> = ({ peek, accept, result }, emit) => {
  if (accept(isNumeric)) {
    emit({ type: "number", value: Number(result()) });
  }
};

export const ExpressionAlphabet: Alphabet<ExpressionToken> = ({ peek, accept }) => {
  accept(isWhitespace);

  if (isNumeric(peek())) {
    return number;
  }

  switch (peek()) {
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
