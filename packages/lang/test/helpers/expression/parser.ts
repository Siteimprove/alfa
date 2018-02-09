import { Grammar, Production } from "../../../src/parser";
import { Expression, Constant, Operator } from "../expression";
import { ExpressionToken, Number, Plus, Minus, Asterix, Slash, Caret, isNumber } from "./lexer";

export type ExpressionProduction<
  T extends ExpressionToken,
  U extends Expression
> = Production<ExpressionToken, T, Expression, U>;

const number: ExpressionProduction<Number, Constant> = {
  token: "number",

  prefix(token) {
    return { type: "constant", value: token.value };
  }
};

const addition: ExpressionProduction<Plus, Constant | Operator> = {
  token: "+",

  prefix(token, { peek, accept }) {
    const num = accept(isNumber);

    if (num === false) {
      throw new Error("Expected number");
    }

    return { type: "constant", value: num.value };
  },

  infix(token, stream, expression, left) {
    const right = expression();

    if (right === null) {
      throw new Error("Expected right-hand-side expression");
    }

    return { type: "operator", value: "+", left, right };
  }
};

const subtraction: ExpressionProduction<Minus, Constant | Operator> = {
  token: "-",

  prefix(token, { peek, accept }) {
    const num = accept(isNumber);

    if (num === false) {
      throw new Error("Expected number");
    }

    return { type: "constant", value: num.value * -1 };
  },

  infix(token, stream, expression, left) {
    const right = expression();

    if (right === null) {
      throw new Error("Expected right-hand-side expression");
    }

    return { type: "operator", value: "-", left, right };
  }
};

const multiplication: ExpressionProduction<Asterix, Operator> = {
  token: "*",

  infix(token, stream, expression, left) {
    const right = expression();

    if (right === null) {
      throw new Error("Expected right-hand-side expression");
    }

    return { type: "operator", value: "*", left, right };
  }
};

const division: ExpressionProduction<Slash, Operator> = {
  token: "/",

  infix(token, stream, expression, left) {
    const right = expression();

    if (right === null) {
      throw new Error("Expected right-hand-side expression");
    }

    return { type: "operator", value: "/", left, right };
  }
};

const exponentiation: ExpressionProduction<Caret, Operator> = {
  token: "^",
  associate: "right",

  infix(token, stream, expression, left) {
    const right = expression();

    if (right === null) {
      throw new Error("Expected right-hand-side expression");
    }

    return { type: "operator", value: "^", left, right };
  }
};

export const ExpressionGrammar: Grammar<ExpressionToken, Expression> = [
  number,
  exponentiation,
  [multiplication, division],
  [addition, subtraction]
];
