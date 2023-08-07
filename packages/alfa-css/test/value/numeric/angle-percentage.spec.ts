import { test } from "@siteimprove/alfa-test";

import { Angle, AnglePercentage } from "../../../src";

import { parser, serializer } from "../../common/parse";

const parse = parser(AnglePercentage.parse);
const serialize = serializer(AnglePercentage.parse);

const resolver: AnglePercentage.Resolver = {
  percentageBase: Angle.of(90, "deg"),
};

test("parse() accepts angles", (t) => {
  t.deepEqual(serialize("2rad"), { type: "angle", value: 2, unit: "rad" });
});

test("parse() accepts math expressions reducing to angles", (t) => {
  t.deepEqual(serialize("calc(2deg + 1turn)"), {
    type: "angle",
    math: {
      type: "math expression",
      expression: {
        type: "value",
        value: { type: "angle", value: 362, unit: "deg" },
      },
    },
  });
});

test("parse() accepts math expressions reducing to percentages", (t) => {
  t.deepEqual(serialize("calc((12% + 9%) * 2)"), {
    type: "percentage",
    math: {
      type: "math expression",
      expression: { type: "value", value: { type: "percentage", value: 0.42 } },
    },
  });
});

test("parse() accepts math expressions mixing angles and percentages", (t) => {
  t.deepEqual(serialize("calc(10deg + 5%)"), {
    type: "angle-percentage",
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
                value: { type: "angle", value: 10, unit: "deg" },
              },
              { type: "value", value: { type: "percentage", value: 0.05 } },
            ],
          },
        ],
      },
    },
  });
});

test("parse() accepts percentages", (t) => {
  t.deepEqual(serialize("20%"), {
    type: "percentage",
    value: 0.2,
  });
});

test("parse() rejects math expressions with lengths", (t) => {
  t.deepEqual(parse("calc(10px + 1em)").isErr(), true);
});

test("parse() rejects math expressions without angles", (t) => {
  t.deepEqual(parse("calc(10 + 1)").isErr(), true);
});

test("resolve() returns canonical angles", (t) => {
  t.deepEqual(parse("1turn").getUnsafe().resolve(resolver).toJSON(), {
    type: "angle",
    value: 360,
    unit: "deg",
  });
});

test("resolve() resolves angle calculations", (t) => {
  t.deepEqual(
    parse("calc(0.5turn + 90deg)").getUnsafe().resolve(resolver).toJSON(),
    { type: "angle", value: 270, unit: "deg" }
  );
});

test("resolve() resolves pure percentages", (t) => {
  t.deepEqual(parse("50%").getUnsafe().resolve(resolver).toJSON(), {
    type: "angle",
    value: 45,
    unit: "deg",
  });
});

test("resolve() resolves percentage calculations", (t) => {
  t.deepEqual(
    parse("calc((12% + 9%) * 2)").getUnsafe().resolve(resolver).toJSON(),
    { type: "angle", value: 37.8, unit: "deg" }
  );
});

test("resolve() resolves mix of angles and percentages", (t) => {
  t.deepEqual(
    parse("calc(0.5turn + 10%)").getUnsafe().resolve(resolver).toJSON(),
    { type: "angle", value: 189, unit: "deg" }
  );
});
