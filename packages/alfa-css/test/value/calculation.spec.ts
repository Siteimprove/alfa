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

test(".parse() parses an addition expression of percentages", (t) => {
  parse(t, "calc(1% + 2%)", {
    type: "calculation",
    root: {
      type: "value",
      value: {
        type: "percentage",
        value: 0.03,
      },
    },
  });
});

test(".parse() parses an addition expression of absolute lengths", (t) => {
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

test(".parse() parses an addition expression of relative lengths", (t) => {
  parse(t, "calc(1em + 2em)", {
    type: "calculation",
    root: {
      type: "value",
      value: {
        type: "length",
        value: 3,
        unit: "em",
      },
    },
  });
});

test(".parse() parses an addition expression of mixed lengths", (t) => {
  parse(t, "calc(1px + 2em)", {
    type: "calculation",
    root: {
      type: "sum",
      operands: [
        {
          type: "value",
          value: {
            type: "length",
            value: 1,
            unit: "px",
          },
        },
        {
          type: "value",
          value: {
            type: "length",
            value: 2,
            unit: "em",
          },
        },
      ],
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

test(".parse() parses a multiplication expression of a number and a percentage", (t) => {
  parse(t, "calc(2 * 3%)", {
    type: "calculation",
    root: {
      type: "value",
      value: {
        type: "percentage",
        value: 0.06,
      },
    },
  });
});

test(".parse() parses a multiplication expression of a number and a length", (t) => {
  parse(t, "calc(2 * 3px)", {
    type: "calculation",
    root: {
      type: "value",
      value: {
        type: "length",
        value: 6,
        unit: "px",
      },
    },
  });
});

test(".parse() gives higher precedence to * and / than + and -", (t) => {
  parse(t, "calc(2 * 3 + 4)", {
    type: "calculation",
    root: {
      type: "value",
      value: {
        type: "number",
        value: 10,
      },
    },
  });

  parse(t, "calc(2 * 3 - 4)", {
    type: "calculation",
    root: {
      type: "value",
      value: {
        type: "number",
        value: 2,
      },
    },
  });

  parse(t, "calc(3 / 2 + 4)", {
    type: "calculation",
    root: {
      type: "value",
      value: {
        type: "number",
        value: 5.5,
      },
    },
  });

  parse(t, "calc(3 / 2 - 4)", {
    type: "calculation",
    root: {
      type: "value",
      value: {
        type: "number",
        value: -2.5,
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
