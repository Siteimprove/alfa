import { test } from "@siteimprove/alfa-test";

import { Lexer } from "../../src/syntax/lexer";
import { Math } from "../../src/value/math-expression";

function parse(input: string) {
  return Math.parse(Lexer.lex(input)).map(([, expr]) => expr);
}

test(".parse() parses a max of two numbers", (t) => {
  const calculation = parse("max(1, 2)").get();

  t(calculation.isNumber());

  t.deepEqual(calculation.toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: { type: "number", value: 2 },
    },
  });
});
