import { test } from "@siteimprove/alfa-test";

import { Length, LengthPercentage, Lexer } from "../../../src";

function parse(input: string) {
  return LengthPercentage.parse(Lexer.lex(input)).map(([, length]) => length);
}

const resolver: LengthPercentage.Resolver = {
  percentageBase: Length.of(16, "px"),
  length: Length.resolver(
    Length.of(16, "px"),
    Length.of(16, "px"),
    Length.of(1920, "px"),
    Length.of(1080, "px")
  ),
};

test("parse() accepts lengths", (t) => {
  t.deepEqual(parse("2em").getUnsafe().toJSON(), {
    type: "length",
    value: 2,
    unit: "em",
  });
});

test("parse() accepts math expressions reducing to lengths", (t) => {
  t.deepEqual(parse("calc(2px + 1vh)").getUnsafe().toJSON(), {
    type: "length",
    math: {
      type: "math expression",
      expression: {
        type: "calculation",
        arguments: [
          {
            type: "sum",
            operands: [
              {
                type: "value",
                value: { type: "length", value: 2, unit: "px" },
              },
              {
                type: "value",
                value: { type: "length", value: 1, unit: "vh" },
              },
            ],
          },
        ],
      },
    },
  });
});

test("parse() accepts math expressions reducing to percentages", (t) => {
  t.deepEqual(parse("calc((12% + 9%) * 2)").getUnsafe().toJSON(), {
    type: "percentage",
    math: {
      type: "math expression",
      expression: {
        type: "value",
        value: {
          type: "percentage",
          value: 0.42,
        },
      },
    },
  });
});

test("parse() accepts math expressions mixing lengths and percentages", (t) => {
  t.deepEqual(parse("calc(10px + 5%)").getUnsafe().toJSON(), {
    type: "length-percentage",
    math: {
      type: "math expression",
      expression: {
        type: "calculation",
        arguments: [
          {
            type: "sum",
            operands: [
              {
                type: "value",
                value: { type: "length", value: 10, unit: "px" },
              },
              {
                type: "value",
                value: { type: "percentage", value: 0.05 },
              },
            ],
          },
        ],
      },
    },
  });
});

test("parse() accepts percentages", (t) => {
  t.deepEqual(parse("20%").getUnsafe().toJSON(), {
    type: "percentage",
    value: 0.2,
  });
});

test("parse() rejects math expressions with angles", (t) => {
  t.deepEqual(parse("calc(10deg + 1rad)").isErr(), true);
});

test("parse() rejects math expressions without length", (t) => {
  t.deepEqual(parse("calc(10 + 1)").isErr(), true);
});

test("resolve() absolutize lengths", (t) => {
  t.deepEqual(parse("2em").getUnsafe().resolve(resolver).toJSON(), {
    type: "length",
    value: 32,
    unit: "px",
  });
});

test("resolve() resolves lengths calculations", (t) => {
  t.deepEqual(parse("calc(1em + 2px)").getUnsafe().resolve(resolver).toJSON(), {
    type: "length",
    value: 18,
    unit: "px",
  });
});

test("resolve() resolves pure percentages", (t) => {
  t.deepEqual(parse("50%").getUnsafe().resolve(resolver).toJSON(), {
    type: "length",
    value: 8,
    unit: "px",
  });
});

test("resolve() resolves mix of lengths and percentages", (t) => {
  t.deepEqual(parse("calc(2em + 10%)").getUnsafe().resolve(resolver).toJSON(), {
    type: "length",
    value: 33.6,
    unit: "px",
  });
});

const resolvePartial = LengthPercentage.resolvePartial({
  length: resolver.length,
});

test("resolvePartial() absolutize lengths", (t) => {
  t.deepEqual(resolvePartial(parse("2em").getUnsafe()).toJSON(), {
    type: "length",
    value: 32,
    unit: "px",
  });
});

test("resolvePartial() resolves lengths calculations", (t) => {
  t.deepEqual(resolvePartial(parse("calc(1em + 2px)").getUnsafe()).toJSON(), {
    type: "length",
    value: 18,
    unit: "px",
  });
});

test("resolvePartial() leaves pure percentages untouched", (t) => {
  t.deepEqual(resolvePartial(parse("50%").getUnsafe()).toJSON(), {
    type: "percentage",
    value: 0.5,
  });
});

test("resolvePartial() simplify calculated percentages", (t) => {
  t.deepEqual(
    resolvePartial(parse("calc((12% + 9%) * 2)").getUnsafe()).toJSON(),
    {
      type: "percentage",
      value: 0.42,
    }
  );
});

test("resolvePartial() leaves mix of lengths and percentages untouched", (t) => {
  t.deepEqual(resolvePartial(parse("calc(10px + 5%)").getUnsafe()).toJSON(), {
    type: "length-percentage",
    math: {
      type: "math expression",
      expression: {
        type: "calculation",
        arguments: [
          {
            type: "sum",
            operands: [
              {
                type: "value",
                value: { type: "length", value: 10, unit: "px" },
              },
              {
                type: "value",
                value: { type: "percentage", value: 0.05 },
              },
            ],
          },
        ],
      },
    },
  });
});
