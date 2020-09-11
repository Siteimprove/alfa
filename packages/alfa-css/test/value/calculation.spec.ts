import { Assertions, test } from "@siteimprove/alfa-test";

import { Slice } from "@siteimprove/alfa-slice";

import { Lexer } from "../../src/syntax/lexer";
import { Calculation } from "../../src/value/calculation";

function parse(t: Assertions, input: string, expected: Calculation.JSON) {
  t.deepEqual(
    Calculation.parse(Slice.of(Lexer.lex(input)))
      .map(([, calculation]) => calculation)
      .get()
      .toJSON(),
    expected,
    input
  );
}

test(".parse() parses an addition expression of numbers", (t) => {
  parse(t, "calc(1 + 2)", {
    type: "calculation",
    root: {
      type: "value",
      value: {
        type: "number",
        value: 3,
      },
    },
  });
});

test(".parse() parses an addition expression of lengths", (t) => {
  parse(t, "calc(1px + 2px)", {
    type: "calculation",
    root: {
      type: "value",
      value: {
        type: "length",
        value: 3,
        unit: "px",
      },
    },
  });
});

test(".parse() parses a multiplication expression of numbers", (t) => {
  parse(t, "calc(2 * 3)", {
    type: "calculation",
    root: {
      type: "value",
      value: {
        type: "number",
        value: 6,
      },
    },
  });
});

test(".parse() parses a nested calc() function", (t) => {
  parse(t, "calc(2 * calc(1 + 2))", {
    type: "calculation",
    root: {
      type: "value",
      value: {
        type: "number",
        value: 6,
      },
    },
  });
});
