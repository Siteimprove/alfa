import { test, Test } from "@alfa/test";
import { WithLocation, lex } from "../src/lexer";
import {
  Expression,
  ExpressionToken,
  ExpressionAlphabet
} from "./helpers/expression";

async function expression(
  t: Test,
  input: string,
  expected: Array<WithLocation<ExpressionToken>>
) {
  t.deepEqual(lex(input, ExpressionAlphabet), expected, "Token lists match");
}

test("Can lex an expression", async t =>
  expression(t, "1 + 2", [
    { type: "number", value: 1, line: 0, column: 0 },
    { type: "+", line: 0, column: 2 },
    { type: "number", value: 2, line: 0, column: 4 }
  ]));
