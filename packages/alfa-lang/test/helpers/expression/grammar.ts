import { Production } from "../../../src/types";
import { Grammar } from "../../../src/grammar";
import { Expression, Constant, Operator } from "../expression";
import {
  TokenType,
  ExpressionToken,
  Number,
  Add,
  Subtract,
  Multiply,
  Divide,
  Exponentiate,
  isNumber
} from "./alphabet";

export type ExpressionProduction<
  T extends ExpressionToken,
  U extends Expression
> = Production<ExpressionToken, Expression, T, U>;

const number: ExpressionProduction<Number, Constant> = {
  token: TokenType.Number,

  prefix(token) {
    return { type: "constant", value: token.value };
  }
};

const addition: ExpressionProduction<Add, Constant | Operator> = {
  token: TokenType.Add,

  prefix(token, stream) {
    const next = stream.next();

    if (next === null || !isNumber(next)) {
      throw new Error("Expected number");
    }

    return {
      type: "constant",
      value: next.value
    };
  },

  infix(token, stream, expression, left) {
    const right = expression();

    if (right === null) {
      throw new Error("Expected right-hand-side expression");
    }

    return { type: "operator", value: "+", left, right };
  }
};

const subtraction: ExpressionProduction<Subtract, Constant | Operator> = {
  token: TokenType.Subtract,

  prefix(token, stream) {
    const next = stream.next();

    if (next === null || !isNumber(next)) {
      throw new Error("Expected number");
    }

    return {
      type: "constant",
      value: next.value * -1
    };
  },

  infix(token, stream, expression, left) {
    const right = expression();

    if (right === null) {
      throw new Error("Expected right-hand-side expression");
    }

    return { type: "operator", value: "-", left, right };
  }
};

const multiplication: ExpressionProduction<Multiply, Operator> = {
  token: TokenType.Multiply,

  infix(token, stream, expression, left) {
    const right = expression();

    if (right === null) {
      throw new Error("Expected right-hand-side expression");
    }

    return { type: "operator", value: "*", left, right };
  }
};

const division: ExpressionProduction<Divide, Operator> = {
  token: TokenType.Divide,

  infix(token, stream, expression, left) {
    const right = expression();

    if (right === null) {
      throw new Error("Expected right-hand-side expression");
    }

    return { type: "operator", value: "/", left, right };
  }
};

const exponentiation: ExpressionProduction<Exponentiate, Operator> = {
  token: TokenType.Exponentiate,
  associate: "right",

  infix(token, stream, expression, left) {
    const right = expression();

    if (right === null) {
      throw new Error("Expected right-hand-side expression");
    }

    return { type: "operator", value: "^", left, right };
  }
};

export const ExpressionGrammar: Grammar<
  ExpressionToken,
  Expression
> = new Grammar([
  number,
  exponentiation,
  [multiplication, division],
  [addition, subtraction]
]);
