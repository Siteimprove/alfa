import { test } from "@siteimprove/alfa-test";

import { Length } from "../../../src/index.ts";

import { parser, serializer } from "../../common/parse.ts";

const parse = parser(Length.parse);
const serialize = serializer(Length.parse);

test("parse() accepts lengths", (t) => {
  t.deepEqual(serialize("2em"), {
    type: "length",
    value: 2,
    unit: "em",
  });
});

test("parse() accepts lh lengths", (t) => {
  t.deepEqual(serialize("2lh"), {
    type: "length",
    value: 2,
    unit: "lh",
  });
});

test("parse() accepts rlh lengths", (t) => {
  t.deepEqual(serialize("2rlh"), {
    type: "length",
    value: 2,
    unit: "rlh",
  });
});

test("parse() accepts rch lengths", (t) => {
  t.deepEqual(serialize("2rch"), {
    type: "length",
    value: 2,
    unit: "rch",
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

test("parse() rejects math expressions with percentages", (t) => {
  t.deepEqual(parse("calc(10px + 5%)").isErr(), true);
});

test("parse() rejects math expressions with angles", (t) => {
  t.deepEqual(parse("calc(10deg + 1rad)").isErr(), true);
});

test("parse() rejects math expressions without length", (t) => {
  t.deepEqual(parse("calc(10 + 1)").isErr(), true);
});

test("resolve() absolutize lengths", (t) => {
  t.deepEqual(
    parse("calc(1em + 2px)")
      .getUnsafe()
      .resolve({ length: () => Length.of(16, "px") })
      .toJSON(),
    {
      type: "length",
      value: 18,
      unit: "px",
    },
  );
});

test("resolver() resolves lh against the provided line-height base", (t) => {
  const resolve = Length.resolver(
    Length.of(16, "px"), // em
    Length.of(16, "px"), // rem
    Length.of(1920, "px"), // vw
    Length.of(1080, "px"), // vh
    Length.of(24, "px"), // line-height base, e.g. `line-height: 24px`
    Length.of(19.2, "px"), // 1.2 * 16px
  );

  t.deepEqual(resolve(Length.of(2, "lh")).toJSON(), {
    type: "length",
    value: 48,
    unit: "px",
  });
});

test("resolve() absolutizes lh in a calculation", (t) => {
  t.deepEqual(
    parse("calc(1lh + 2px)")
      .getUnsafe()
      .resolve({ length: Length.resolver(
        Length.of(16, "px"),
        Length.of(16, "px"),
        Length.of(1920, "px"),
        Length.of(1080, "px"),
        Length.of(24, "px"),
        Length.of(19.2, "px"), // 1.2 * 16px
      ) })
      .toJSON(),
    {
      type: "length",
      value: 26,
      unit: "px",
    },
  );
});

test("resolver() resolves rlh against the provided root line-height base", (t) => {
  const resolve = Length.resolver(
    Length.of(16, "px"), // em
    Length.of(16, "px"), // rem
    Length.of(1920, "px"), // vw
    Length.of(1080, "px"), // vh
    Length.of(24, "px"), // lh base
    Length.of(32, "px"), // rlh base, e.g. root `line-height: 32px`
  );

  t.deepEqual(resolve(Length.of(2, "rlh")).toJSON(), {
    type: "length",
    value: 64,
    unit: "px",
  });
});


test("resolve() resolves dimension divisions", (t) => {
  t.deepEqual(
    parse("calc(100px * 180deg * 8px / 1em / 1turn)")
      .getUnsafe()
      .resolve({
        length: (value) => {
          switch (value.unit) {
            case "em":
              return Length.of(16, "px");
            default:
              return Length.of(1, "px");
          }
        },
      })
      .toJSON(),
    // Due to rounding Numeric to 7 decimals, we have floating point problems.
    { type: "length", value: 25.0002, unit: "px" },
  );
});

test("resolver() resolves rch against half the rem base", (t) => {
  const resolve = Length.resolver(
    Length.of(16, "px"), // em
    Length.of(32, "px"), // rem
    Length.of(1920, "px"), // vw
    Length.of(1080, "px"), // vh
    Length.of(19.2, "px"), // lh, 1.2 * 16px
    Length.of(19.2, "px"), // rlh, 1.2 * 16px
  );

  t.deepEqual(resolve(Length.of(2, "rch")).toJSON(), {
    type: "length",
    value: 32,
    unit: "px",
  });

  t.deepEqual(resolve(Length.of(2, "ch")).toJSON(), {
    type: "length",
    value: 16,
    unit: "px",
  });
});
