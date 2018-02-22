import { test, Test } from "@alfa/test";
import { WithLocation, lex } from "../src/lexer";
import {
  Expression,
  ExpressionToken,
  ExpressionAlphabet
} from "./helpers/expression";

function expression(
  t: Test,
  input: string,
  expected: Array<WithLocation<ExpressionToken>>
) {
  t.deepEqual(lex(input, ExpressionAlphabet), expected, "Token lists match");
}

test("Can lex an expression", async t =>
  expression(t, "1 + 2", [
    {
      type: "number",
      value: 1,
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 1 }
      }
    },
    {
      type: "+",
      location: {
        start: { line: 0, column: 2 },
        end: { line: 0, column: 3 }
      }
    },
    {
      type: "number",
      value: 2,
      location: {
        start: { line: 0, column: 4 },
        end: { line: 0, column: 5 }
      }
    }
  ]));
