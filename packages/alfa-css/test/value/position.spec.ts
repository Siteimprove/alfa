import { test } from "@siteimprove/alfa-test";

import { Length, Lexer, Math, Position } from "../../src";

function parse(input: string, legacySyntax: boolean = false) {
  return Position.parse(legacySyntax)(Lexer.lex(input))
    .map(([, position]) => position.toJSON())
    .getUnsafe();
}

test(".parse() parses 1-token positions", (t) => {
  t.deepEqual(parse("center"), {
    type: "position",
    horizontal: { type: "keyword", value: "center" },
    vertical: { type: "keyword", value: "center" },
  });

  t.deepEqual(parse("right"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "right" },
      offset: null,
    },
    vertical: { type: "keyword", value: "center" },
  });

  t.deepEqual(parse("top"), {
    type: "position",
    horizontal: { type: "keyword", value: "center" },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "top" },
      offset: null,
    },
  });

  t.deepEqual(parse("10px"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: { type: "length", unit: "px", value: 10 },
    },
    vertical: { type: "keyword", value: "center" },
  });

  // "10px" is not consumed
  t.deepEqual(parse("top 10px"), {
    type: "position",
    horizontal: { type: "keyword", value: "center" },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "top" },
      offset: null,
    },
  });

  // "left" is not consumed
  t.deepEqual(parse("10px left"), {
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
  t.deepEqual(parse("left bottom"), {
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

  t.deepEqual(parse("bottom left"), {
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

  t.deepEqual(parse("left center"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: null,
    },
    vertical: { type: "keyword", value: "center" },
  });

  t.deepEqual(parse("center left"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: null,
    },
    vertical: { type: "keyword", value: "center" },
  });

  t.deepEqual(parse("left 10px"), {
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

  t.deepEqual(parse("10px top"), {
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

  t.deepEqual(parse("10px 20%"), {
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
  t.deepEqual(parse("10px top 20%", true), {
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
  t.deepEqual(parse("left 10px 20%", true), {
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
  t.deepEqual(parse("left top 10px"), {
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
  t.deepEqual(parse("top 10px left"), {
    type: "position",
    horizontal: { type: "keyword", value: "center" },
    vertical: {
      type: "side",
      side: { type: "keyword", value: "top" },
      offset: null,
    },
  });

  // "10px" not consumed
  t.deepEqual(parse("top left 10px"), {
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
  t.deepEqual(parse("center 20% right 10px"), {
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
  t.deepEqual(parse("left 10px center", true), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: { type: "length", unit: "px", value: 10 },
    },
    vertical: { type: "keyword", value: "center" },
  });

  t.deepEqual(parse("left top 10px", true), {
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

  t.deepEqual(parse("top 10px left", true), {
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

  t.deepEqual(parse("top left 10px", true), {
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
  t.deepEqual(parse("right 10px bottom 20%"), {
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

  t.deepEqual(parse("bottom 20% right 10px"), {
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

  t.deepEqual(parse("calc(10px + 5%)"), {
    type: "position",
    horizontal: {
      type: "side",
      side: { type: "keyword", value: "left" },
      offset: { type: "length-percentage", math: calcJSON },
    },
    vertical: { type: "keyword", value: "center" },
  });

  t.deepEqual(parse("left calc(10px + 5%)"), {
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

  t.deepEqual(parse("calc(10px + 5%) calc(10px + 5%)"), {
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

  t.deepEqual(parse("top calc(10px + 5%) left", true), {
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

  t.deepEqual(parse("right calc(10px + 5%) bottom calc(10px + 5%)"), {
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
  const actual = Position.parse()(Lexer.lex("left calc(1em + 5%) top 20%"))
    .map(([, position]) => position)
    .getUnsafe();

  t.deepEqual(
    actual
      .resolve({
        length: Length.resolver(
          Length.of(16, "px"),
          Length.of(0, "px"),
          Length.of(0, "px"),
          Length.of(0, "px")
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
    }
  );
});

test(".partiallyResolve() partially resolves positions", (t) => {
  const actual = Position.parse()(
    Lexer.lex("left calc(1em + 1px) top calc(20% + 10%)")
  )
    .map(([, position]) => position)
    .getUnsafe();

  t.deepEqual(
    Position.partiallyResolve({
      length: Length.resolver(
        Length.of(16, "px"),
        Length.of(0, "px"),
        Length.of(0, "px"),
        Length.of(0, "px")
      ),
    })(actual).toJSON(),
    {
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
    }
  );
});
