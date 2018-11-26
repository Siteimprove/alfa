import { Assertions, test } from "@siteimprove/alfa-test";
import { parse } from "../src/parse";
import { Expression, Grammar, Token, TokenType } from "./helpers/expression";

function expression(t: Assertions, input: Array<Token>, expected: Expression) {
  const { result, done } = parse(input, Grammar);

  t(done);
  t.deepEqual(result, expected);
}

test("Correctly handles operator precedence", t => {
  expression(
    t,
    [
      { type: TokenType.Number, value: 1 },
      { type: TokenType.Multiply },
      { type: TokenType.Number, value: 2 },
      { type: TokenType.Add },
      { type: TokenType.Number, value: 3 }
    ],
    {
      type: "operator",
      value: "+",
      left: {
        type: "operator",
        value: "*",
        left: { type: "constant", value: 1 },
        right: { type: "constant", value: 2 }
      },
      right: { type: "constant", value: 3 }
    }
  );
});

test("Correctly handles associativity", t => {
  expression(
    t,
    [
      { type: TokenType.Number, value: 1 },
      { type: TokenType.Multiply },
      { type: TokenType.Number, value: 2 },
      { type: TokenType.Add },
      { type: TokenType.Number, value: 3 }
    ],
    {
      type: "operator",
      value: "+",
      left: {
        type: "operator",
        value: "*",
        left: { type: "constant", value: 1 },
        right: { type: "constant", value: 2 }
      },
      right: { type: "constant", value: 3 }
    }
  );
});
