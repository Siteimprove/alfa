import * as Lang from "../../../src";
import { Constant, Expression, Operator } from "../expression";
import { isNumber, Token, Tokens, TokenType } from "./alphabet";

export type Production<T extends Token, U extends Expression> = Lang.Production<
  Token,
  Expression,
  T,
  U
>;

const number: Production<Tokens.Number, Constant> = {
  token: TokenType.Number,

  prefix(token) {
    return { type: "constant", value: token.value };
  }
};

const addition: Production<Tokens.Add, Constant | Operator> = {
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

const subtraction: Production<Tokens.Subtract, Constant | Operator> = {
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

const multiplication: Production<Tokens.Multiply, Operator> = {
  token: TokenType.Multiply,

  infix(token, stream, expression, left) {
    const right = expression();

    if (right === null) {
      throw new Error("Expected right-hand-side expression");
    }

    return { type: "operator", value: "*", left, right };
  }
};

const division: Production<Tokens.Divide, Operator> = {
  token: TokenType.Divide,

  infix(token, stream, expression, left) {
    const right = expression();

    if (right === null) {
      throw new Error("Expected right-hand-side expression");
    }

    return { type: "operator", value: "/", left, right };
  }
};

const exponentiation: Production<Tokens.Exponentiate, Operator> = {
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

export const Grammar: Lang.Grammar<Token, Expression> = new Lang.Grammar(
  [number, exponentiation, [multiplication, division], [addition, subtraction]],
  () => null
);
