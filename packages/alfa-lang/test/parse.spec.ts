import { test, Test } from "@siteimprove/alfa-test";
import { parse } from "../src/parse";
import {
  TokenType,
  Expression,
  ExpressionToken,
  ExpressionGrammar
} from "./helpers/expression";

function expression(
  t: Test,
  input: Array<ExpressionToken>,
  expected: Expression
) {
  t.deepEqual(parse(input, ExpressionGrammar), expected, "Parse trees match");
}

test("Correctly handles operator precedence", t =>
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
  ));
