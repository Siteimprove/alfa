import { test } from "@siteimprove/alfa-test";

import { Length, LengthPercentage } from "../../../src";

import { parser, serializer } from "../../common/parse";

const parse = parser(LengthPercentage.parse);
const serialize = serializer(LengthPercentage.parse);

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
  t.deepEqual(serialize("2em"), {
    type: "length",
    value: 2,
    unit: "em",
  });
});

test("parse() accepts math expressions reducing to lengths", (t) => {
  t.deepEqual(serialize("calc(2px + 1vh)"), {
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
  t.deepEqual(serialize("calc((12% + 9%) * 2)"), {
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
  t.deepEqual(serialize("calc(10px + 5%)"), {
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
  t.deepEqual(serialize("20%"), { type: "percentage", value: 0.2 });
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

test("resolve() resolves percentage calculations", (t) => {
  t.deepEqual(
    parse("calc((12% + 9%) * 2)").getUnsafe().resolve(resolver).toJSON(),
    {
      type: "length",
      value: 6.72,
      unit: "px",
    }
  );
});

test("resolve() resolves mix of lengths and percentages", (t) => {
  t.deepEqual(parse("calc(2em + 10%)").getUnsafe().resolve(resolver).toJSON(), {
    type: "length",
    value: 33.6,
    unit: "px",
  });
});

const partiallyResolve = LengthPercentage.partiallyResolve({
  length: resolver.length,
});

test("partiallyResolve() absolutize lengths", (t) => {
  t.deepEqual(partiallyResolve(parse("2em").getUnsafe()).toJSON(), {
    type: "length",
    value: 32,
    unit: "px",
  });
});

test("partiallyResolve() resolves lengths calculations", (t) => {
  t.deepEqual(partiallyResolve(parse("calc(1em + 2px)").getUnsafe()).toJSON(), {
    type: "length",
    value: 18,
    unit: "px",
  });
});

test("partiallyResolve() leaves pure percentages untouched", (t) => {
  t.deepEqual(partiallyResolve(parse("50%").getUnsafe()).toJSON(), {
    type: "percentage",
    value: 0.5,
  });
});

test("partiallyResolve() simplify calculated percentages", (t) => {
  t.deepEqual(
    partiallyResolve(parse("calc((12% + 9%) * 2)").getUnsafe()).toJSON(),
    {
      type: "percentage",
      value: 0.42,
    }
  );
});

test("partiallyResolve() leaves mix of lengths and percentages untouched", (t) => {
  t.deepEqual(partiallyResolve(parse("calc(10px + 5%)").getUnsafe()).toJSON(), {
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
