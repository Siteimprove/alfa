import { test, Test } from "@siteimprove/alfa-test";
import { lex } from "../src/lex";
import { ExpressionToken, ExpressionAlphabet } from "./helpers/expression";

function expression(t: Test, input: string, expected: Array<ExpressionToken>) {
  t.deepEqual(lex(input, ExpressionAlphabet), expected, "Token lists match");
}

test("Can lex an expression", t =>
  expression(t, "1 + 2", [
    {
      type: "number",
      value: 1
    },
    {
      type: "+"
    },
    {
      type: "number",
      value: 2
    }
  ]));
