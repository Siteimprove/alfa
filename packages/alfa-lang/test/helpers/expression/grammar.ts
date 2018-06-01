import { Production } from "../../../src/types";
import { Grammar } from "../../../src/grammar";
import { Expression, Constant, Operator } from "../expression";
import {
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
  token: "number",

  prefix(token) {
    return { type: "constant", value: token.value };
  }
};

const addition: ExpressionProduction<Add, Constant | Operator> = {
  token: "+",

  prefix(token, stream) {
    const numbers = stream.accept(isNumber);

    if (numbers === false) {
      throw new Error("Expected number");
    }

    return {
      type: "constant",
      value: numbers.reduce((number, { value }) => 10 * number + value, 0)
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
  token: "-",

  prefix(token, stream) {
    const numbers = stream.accept(isNumber);

    if (numbers === false) {
      throw new Error("Expected number");
    }

    return {
      type: "constant",
      value: -1 * numbers.reduce((number, { value }) => 10 * number + value, 0)
    };
  },

  infix(token, stream, expression, left) {
    const right = expression();

    if (right === null) {
      throw new Error("Expected right-hand-side expression");
    }

    return { type: "operator", value: token, left, right };
  }
};

const multiplication: ExpressionProduction<Multiply, Operator> = {
  token: "*",

  infix(token, stream, expression, left) {
    const right = expression();

    if (right === null) {
      throw new Error("Expected right-hand-side expression");
    }

    return { type: "operator", value: token, left, right };
  }
};

const division: ExpressionProduction<Divide, Operator> = {
  token: "/",

  infix(token, stream, expression, left) {
    const right = expression();

    if (right === null) {
      throw new Error("Expected right-hand-side expression");
    }

    return { type: "operator", value: token, left, right };
  }
};

const exponentiation: ExpressionProduction<Exponentiate, Operator> = {
  token: "^",
  associate: "right",

  infix(token, stream, expression, left) {
    const right = expression();

    if (right === null) {
      throw new Error("Expected right-hand-side expression");
    }

    return { type: "operator", value: token, left, right };
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
