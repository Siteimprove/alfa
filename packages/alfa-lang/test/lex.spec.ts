import { Assertions, test } from "@siteimprove/alfa-test";
import { lex } from "../src/lex";
import { Alphabet, Token, TokenType } from "./helpers/expression";

function expression(t: Assertions, input: string, expected: Array<Token>) {
  const { result, done } = lex(input, Alphabet);

  t(done);
  t.deepEqual(result, expected);
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
