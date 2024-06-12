import { test } from "@siteimprove/alfa-test";

import { Length, Math, Position } from "../../dist";
import { parserUnsafe, serializer } from "../common/parse";

const parse = parserUnsafe(Position.parse());
const serialize = serializer(Position.parse());
const serializeLegacy = serializer(Position.parse(true));

test(".parse() parses 1-token positions", (t) => {
  t.deepEqual(serialize("center"), {
    type: "position",
    horizontal: { type: "keyword", value: "center" },
    vertical: { type: "keyword", value: "center" },
  });

  t.deepEqual(serialize("right"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "right" },
      offset: null,
    },
    vertical: { type: "keyword", value: "center" },
  });

  t.deepEqual(serialize("top"), {
    type: "position",
    horizontal: { type: "keyword", value: "center" },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "top" },
      offset: null,
    },
  });

  t.deepEqual(serialize("10px"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: { type: "length", unit: "px", value: 10 },
    },
    vertical: { type: "keyword", value: "center" },
  });

  // "10px" is not consumed
  t.deepEqual(serialize("top 10px"), {
    type: "position",
    horizontal: { type: "keyword", value: "center" },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "top" },
      offset: null,
    },
  });

  // "left" is not consumed
  t.deepEqual(serialize("10px left"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: { type: "length", unit: "px", value: 10 },
    },
    vertical: { type: "keyword", value: "center" },
  });
});

test(".parse() parses 2-token positions", (t) => {
  t.deepEqual(serialize("left bottom"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: null,
    },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "bottom" },
      offset: null,
    },
  });

  t.deepEqual(serialize("bottom left"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: null,
    },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "bottom" },
      offset: null,
    },
  });

  t.deepEqual(serialize("left center"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: null,
    },
    vertical: { type: "keyword", value: "center" },
  });

  t.deepEqual(serialize("center left"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: null,
    },
    vertical: { type: "keyword", value: "center" },
  });

  t.deepEqual(serialize("left 10px"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: null,
    },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "top" },
      offset: { type: "length", unit: "px", value: 10 },
    },
  });

  t.deepEqual(serialize("10px top"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: { type: "length", unit: "px", value: 10 },
    },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "top" },
      offset: null,
    },
  });

  t.deepEqual(serialize("10px 20%"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: { type: "length", unit: "px", value: 10 },
    },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "top" },
      offset: { type: "percentage", value: 0.2 },
    },
  });

  // "20%" is not consumed
  t.deepEqual(serializeLegacy("10px top 20%"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: { type: "length", unit: "px", value: 10 },
    },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "top" },
      offset: null,
    },
  });

  // "20%" is not consumed
  t.deepEqual(serializeLegacy("left 10px 20%"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: null,
    },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "top" },
      offset: { type: "length", unit: "px", value: 10 },
    },
  });

  // "10px" not consumed
  t.deepEqual(serialize("left top 10px"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: null,
    },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "top" },
      offset: null,
    },
  });

  // "left" not consumed
  t.deepEqual(serialize("top 10px left"), {
    type: "position",
    horizontal: { type: "keyword", value: "center" },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "top" },
      offset: null,
    },
  });

  // "10px" not consumed
  t.deepEqual(serialize("top left 10px"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: null,
    },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "top" },
      offset: null,
    },
  });

  // "right 10px" not consumed
  t.deepEqual(serialize("center 20% right 10px"), {
    type: "position",
    horizontal: { type: "keyword", value: "center" },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "top" },
      offset: { type: "percentage", value: 0.2 },
    },
  });
});

test(".parse() parses 3-token positions", (t) => {
  t.deepEqual(serializeLegacy("left 10px center"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: { type: "length", unit: "px", value: 10 },
    },
    vertical: { type: "keyword", value: "center" },
  });

  t.deepEqual(serializeLegacy("left top 10px"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: null,
    },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "top" },
      offset: { type: "length", unit: "px", value: 10 },
    },
  });

  t.deepEqual(serializeLegacy("top 10px left"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: null,
    },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "top" },
      offset: { type: "length", unit: "px", value: 10 },
    },
  });

  t.deepEqual(serializeLegacy("top left 10px"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: { type: "length", unit: "px", value: 10 },
    },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "top" },
      offset: null,
    },
  });
});

test(".parse() parses 4-token positions", (t) => {
  t.deepEqual(serialize("right 10px bottom 20%"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "right" },
      offset: { type: "length", unit: "px", value: 10 },
    },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "bottom" },
      offset: { type: "percentage", value: 0.2 },
    },
  });

  t.deepEqual(serialize("bottom 20% right 10px"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "right" },
      offset: { type: "length", unit: "px", value: 10 },
    },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "bottom" },
      offset: { type: "percentage", value: 0.2 },
    },
  });
});

test(".parse() accepts calculations", (t) => {
  const calcJSON: Math.JSON = {
    /* calc(10px + 5%) */ type: "math expression",
    expression: {
      type: "calculation",
      arguments: [
        {
          type: "sum",
          operands: [
            { type: "value", value: { type: "length", unit: "px", value: 10 } },
            { type: "value", value: { type: "percentage", value: 0.05 } },
          ],
        },
      ],
    },
  };

  t.deepEqual(serialize("calc(10px + 5%)"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: { type: "length-percentage", math: calcJSON },
    },
    vertical: { type: "keyword", value: "center" },
  });

  t.deepEqual(serialize("left calc(10px + 5%)"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: null,
    },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "top" },
      offset: { type: "length-percentage", math: calcJSON },
    },
  });

  t.deepEqual(serialize("calc(10px + 5%) calc(10px + 5%)"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: { type: "length-percentage", math: calcJSON },
    },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "top" },
      offset: { type: "length-percentage", math: calcJSON },
    },
  });

  t.deepEqual(serializeLegacy("top calc(10px + 5%) left"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: null,
    },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "top" },
      offset: { type: "length-percentage", math: calcJSON },
    },
  });

  t.deepEqual(serialize("right calc(10px + 5%) bottom calc(10px + 5%)"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "right" },
      offset: { type: "length-percentage", math: calcJSON },
    },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "bottom" },
      offset: { type: "length-percentage", math: calcJSON },
    },
  });
});

test(".resolve() fully resolves positions", (t) => {
  const actual = parse("left calc(1em + 5%) top 20%");

  t.deepEqual(
    actual
      .resolve({
        length: Length.resolver(
          Length.of(16, "px"),
          Length.of(0, "px"),
          Length.of(0, "px"),
          Length.of(0, "px"),
        ),
        percentageHBase: Length.of(10, "px"),
        percentageVBase: Length.of(20, "px"),
      })
      .toJSON(),
    {
      type: "position",
      horizontal: {
        type: "side",
        side: { type: "keyword", value: "left" },
        offset: { type: "length", unit: "px", value: 16.5 },
      },
      vertical: {
        type: "side",
        side: { type: "keyword", value: "top" },
        offset: { type: "length", unit: "px", value: 4 },
      },
    },
  );
});

test(".partiallyResolve() partially resolves positions", (t) => {
  const actual = parse(
    "left calc(1em + 1px) top calc(20% + 10%)",
  ).partiallyResolve({
    length: Length.resolver(
      Length.of(16, "px"),
      Length.of(0, "px"),
      Length.of(0, "px"),
      Length.of(0, "px"),
    ),
  });

  t.deepEqual(actual.toJSON(), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: { type: "length", unit: "px", value: 17 },
    },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "top" },
      offset: { type: "percentage", value: 0.3 },
    },
  });
});
