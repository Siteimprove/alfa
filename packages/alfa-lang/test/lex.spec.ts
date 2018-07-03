import { Assertions, test } from "@siteimprove/alfa-test";
import { lex } from "../src/lex";
import {
  ExpressionAlphabet,
  ExpressionToken,
  TokenType
} from "./helpers/expression";

function expression(
  t: Assertions,
  input: string,
  expected: Array<ExpressionToken>
) {
  t.deepEqual(lex(input, ExpressionAlphabet), expected, input);
}

test("Can lex an expression", t => {
  expression(t, "1 + 2", [
    {
      type: TokenType.Number,
      value: 1
    },
    {
      type: TokenType.Add
    },
    {
      type: TokenType.Number,
      value: 2
    }
  ]);
});
