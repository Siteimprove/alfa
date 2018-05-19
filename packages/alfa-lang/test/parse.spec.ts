import { test, Test } from "@siteimprove/alfa-test";
import { parse } from "../src/parse";
import {
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
      { type: "number", value: 1 },
      { type: "*" },
      { type: "number", value: 2 },
      { type: "+" },
      { type: "number", value: 3 }
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
