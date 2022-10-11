import { test } from "@siteimprove/alfa-test";

import { Lexer } from "../../src/syntax/lexer";
import { Math } from "../../src/value/math-expression";

function parse(input: string) {
  return Math.parse(Lexer.lex(input)).map(([, calculation]) => calculation);
}

test(".parse() parses an addition expression of numbers", (t) => {
  const calculation = parse("calc(1 + 2)").get();

  t(calculation.isNumber());

  t.deepEqual(calculation.toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: {
        type: "number",
        value: 3,
      },
    },
  });
});

test(".parse() parses an addition expression of percentages", (t) => {
  const calculation = parse("calc(1% + 2%)").get();

  t(calculation.isPercentage());

  t.deepEqual(calculation.toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: {
        type: "percentage",
        value: 0.03,
      },
    },
  });
});

test(".parse() parses an addition expression of absolute lengths", (t) => {
  const calculation = parse("calc(1px + 2px)").get();

  t(calculation.isDimension("length"));

  t.deepEqual(calculation.toJSON(), {
    type: "math expression",
    expression: {
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
  const calculation = parse("calc(1em + 2em)").get();

  t(calculation.isDimension("length"));

  t.deepEqual(calculation.toJSON(), {
    type: "math expression",
    expression: {
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
  const calculation = parse("calc(1px + 2em)").get();

  t(calculation.isDimension("length"));

  t.deepEqual(calculation.toJSON(), {
    type: "math expression",
    expression: {
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

test(".parse() parses an addition expression of a length and a percentage", (t) => {
  const calculation = parse("calc(1px + 2%").get();

  t(calculation.isDimensionPercentage("length"));

  t.deepEqual(calculation.toJSON(), {
    type: "math expression",
    expression: {
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
            type: "percentage",
            value: 0.02,
          },
        },
      ],
    },
  });
});

test(".parse() parses a multiplication expression of numbers", (t) => {
  const calculation = parse("calc(2 * 3)").get();

  t(calculation.isNumber());

  t.deepEqual(calculation.toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: {
        type: "number",
        value: 6,
      },
    },
  });
});

test(".parse() parses a multiplication expression of a number and a percentage", (t) => {
  const calculation = parse("calc(2 * 3%)").get();

  t(calculation.isPercentage());

  t.deepEqual(calculation.toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: {
        type: "percentage",
        value: 0.06,
      },
    },
  });
});

test(".parse() parses a multiplication expression of a number and a length", (t) => {
  const calculation = parse("calc(2 * 3px)").get();

  t(calculation.isDimension("length"));

  t.deepEqual(calculation.toJSON(), {
    type: "math expression",
    expression: {
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
  t.deepEqual(parse("calc(2 * 3 + 4)").get().toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: {
        type: "number",
        value: 10,
      },
    },
  });

  t.deepEqual(parse("calc(2 + 3 * 4)").get().toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: {
        type: "number",
        value: 14,
      },
    },
  });

  t.deepEqual(parse("calc(2 * 3 - 4)").get().toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: {
        type: "number",
        value: 2,
      },
    },
  });

  t.deepEqual(parse("calc(3 / 2 + 4)").get().toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: {
        type: "number",
        value: 5.5,
      },
    },
  });

  t.deepEqual(parse("calc(3 / 2 - 4)").get().toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: {
        type: "number",
        value: -2.5,
      },
    },
  });
});

test(".parse() parses a nested calc() function", (t) => {
  const calculation = parse("calc(2 * calc(1 + 2))").get();

  t(calculation.isNumber());

  t.deepEqual(calculation.toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: {
        type: "number",
        value: 6,
      },
    },
  });
});

test(".parse() parses longer operations chain", (t) => {
  const calculation1 = parse("calc(1 - 2 + 3").get();

  t(calculation1.isNumber());

  t.deepEqual(calculation1.toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: {
        type: "number",
        value: 2,
      },
    },
  });

  const calculation2 = parse("calc(10 / 2 * 5").get();

  t(calculation2.isNumber());

  t.deepEqual(calculation2.toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: {
        type: "number",
        value: 25,
      },
    },
  });
});

test(".parse() rejects sums without surrounding spaces", (t) => {
  const calculation1 = parse("calc(1+2)");

  t(calculation1.isErr());

  const calculation2 = parse("calc(1-2)");

  t(calculation2.isErr());
});

test(".parse() accepts products without surrounding spaces", (t) => {
  const calculation1 = parse("calc(1*2)").get();

  t(calculation1.isNumber());

  t.deepEqual(calculation1.toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: {
        type: "number",
        value: 2,
      },
    },
  });

  const calculation2 = parse("calc(1/2)").get();

  t(calculation2.isNumber());

  t.deepEqual(calculation2.toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: {
        type: "number",
        value: 0.5,
      },
    },
  });
});

test(".pares() accepts nesting parenthesis", (t) => {
  const calculation = parse("calc((1 + 1) * (2 + 2))").get();

  t(calculation.isNumber());

  t.deepEqual(calculation.toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: {
        type: "number",
        value: 8,
      },
    },
  });
});
