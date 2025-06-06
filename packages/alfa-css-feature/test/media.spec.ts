import { test } from "@siteimprove/alfa-test";

import { Lexer } from "@siteimprove/alfa-css";
import {
  Device,
  Display,
  Preference,
  Viewport,
} from "@siteimprove/alfa-device";

import { Feature } from "../dist/index.js";

function parse(input: string) {
  return Feature.parseMediaQuery(Lexer.lex(input)).map(([, query]) => query);
}

test(".parse() parses a simple query for an orientation feature", (t) => {
  t.deepEqual(parse("(orientation: portrait)").getUnsafe().toJSON(), [
    {
      modifier: null,
      type: null,
      condition: {
        type: "feature",
        name: "orientation",
        value: {
          type: "discrete",
          value: { type: "keyword", value: "portrait" },
        },
      },
    },
  ]);
});

test(".parse() parses a simple query for a length feature", (t) => {
  t.deepEqual(parse("(min-width: 0)").getUnsafe().toJSON(), [
    {
      modifier: null,
      type: null,
      condition: {
        type: "feature",
        name: "width",
        value: {
          type: "range",
          minimum: {
            value: { type: "length", value: 0, unit: "px" },
            isInclusive: true,
          },
          maximum: null,
        },
      },
    },
  ]);
});

test(".parse() parses a list of queries", (t) => {
  t.deepEqual(
    parse(
      "screen, (orientation: landscape) and ((max-width: 640px) or (not (min-height: 100px)))",
    )
      .getUnsafe()
      .toJSON(),
    [
      { modifier: null, type: { name: "screen" }, condition: null },
      {
        modifier: null,
        type: null,
        condition: {
          type: "and",
          left: {
            type: "feature",
            name: "orientation",
            value: {
              type: "discrete",
              value: { type: "keyword", value: "landscape" },
            },
          },
          right: {
            type: "or",
            left: {
              type: "feature",
              name: "width",
              value: {
                type: "range",
                minimum: null,
                maximum: {
                  value: { type: "length", value: 640, unit: "px" },
                  isInclusive: true,
                },
              },
            },
            right: {
              type: "not",
              condition: {
                type: "feature",
                name: "height",
                value: {
                  type: "range",
                  minimum: {
                    value: { type: "length", value: 100, unit: "px" },
                    isInclusive: true,
                  },
                  maximum: null,
                },
              },
            },
          },
        },
      },
    ],
  );
});

test(".parse() parses a list of mixed type and feature queries", (t) => {
  t.deepEqual(
    parse("screen and (orientation: portrait) and (min-width: 100px)")
      .getUnsafe()
      .toJSON(),
    [
      {
        modifier: null,
        type: { name: "screen" },
        condition: {
          type: "and",
          left: {
            type: "feature",
            name: "orientation",
            value: {
              type: "discrete",
              value: { type: "keyword", value: "portrait" },
            },
          },
          right: {
            type: "feature",
            name: "width",
            value: {
              type: "range",
              minimum: {
                value: { type: "length", value: 100, unit: "px" },
                isInclusive: true,
              },
              maximum: null,
            },
          },
        },
      },
    ],
  );
});

test(".parse() does not create a modifier in the absence of a type", (t) => {
  t.deepEqual(
    parse("not screen and (orientation: landscape)").getUnsafe().toJSON(),
    [
      {
        modifier: "not",
        type: { name: "screen" },
        condition: {
          type: "feature",
          name: "orientation",
          value: {
            type: "discrete",
            value: { type: "keyword", value: "landscape" },
          },
        },
      },
    ],
  );

  t.deepEqual(parse("not (orientation: landscape)").getUnsafe().toJSON(), [
    {
      modifier: null,
      type: null,
      condition: {
        type: "not",
        condition: {
          type: "feature",
          name: "orientation",
          value: {
            type: "discrete",
            value: { type: "keyword", value: "landscape" },
          },
        },
      },
    },
  ]);
});

for (const input of [
  "screen or (min-width: 100px)",
  "(orientation: portrait) and (scripting: none) or (min-width: 100px)",
  "(example, all, )",
  "or and (orientation)",
  "(unknown)",
  "(max-weight: 3px) or (orientation)",
  "(min-orientation: portrait)",
  "(max-width: 3km)",
  "(orientation: 2px)",
  "(orientation: south)",
  "(width: portrait)",
  "(orientation = portrait)",
  "(100px < width > 200px)",
]) {
  test(`.parse() returns "not all" for ${input}`, (t) => {
    t.deepEqual(parse(`${input}`).getUnsafe().toJSON(), [
      {
        modifier: "not",
        type: { name: "all" },
        condition: null,
      },
    ]);
  });
}

test(`.parse() only drops invalid queries in a list, but leaves valid queries`, (t) => {
  t.deepEqual(parse("(max-weight: 3px), (width: 100px)").getUnsafe().toJSON(), [
    {
      modifier: "not",
      type: { name: "all" },
      condition: null,
    },
    {
      modifier: null,
      type: null,
      condition: {
        type: "feature",
        name: "width",
        value: {
          type: "discrete",
          value: { type: "length", value: 100, unit: "px" },
        },
      },
    },
  ]);
});

test(".parse() accepts unknown media types", (t) => {
  t.deepEqual(parse("unknown").getUnsafe().toJSON(), [
    {
      modifier: null,
      type: { name: "unknown" },
      condition: null,
    },
  ]);
});

test(".parse() parses a value < feature range", (t) => {
  t.deepEqual(parse("(100px < width)").getUnsafe().toJSON(), [
    {
      modifier: null,
      type: null,
      condition: {
        type: "feature",
        name: "width",
        value: {
          type: "range",
          minimum: {
            value: { type: "length", value: 100, unit: "px" },
            isInclusive: false,
          },
          maximum: null,
        },
      },
    },
  ]);
});

test(".parse() parses a feature > value range", (t) => {
  t.deepEqual(parse("(width > 100px)").getUnsafe().toJSON(), [
    {
      modifier: null,
      type: null,
      condition: {
        type: "feature",
        name: "width",
        value: {
          type: "range",
          minimum: {
            value: { type: "length", value: 100, unit: "px" },
            isInclusive: false,
          },
          maximum: null,
        },
      },
    },
  ]);
});

test(".parse() parses a length feature > 0 as a dimensional bound", (t) => {
  t.deepEqual(parse("(width > 0)").getUnsafe().toJSON(), [
    {
      modifier: null,
      type: null,
      condition: {
        type: "feature",
        name: "width",
        value: {
          type: "range",
          minimum: {
            value: { type: "length", value: 0, unit: "px" },
            isInclusive: false,
          },
          maximum: null,
        },
      },
    },
  ]);
});

test(".parse() parses a value < feature < value range", (t) => {
  t.deepEqual(parse("(100px < width < 500px)").getUnsafe().toJSON(), [
    {
      modifier: null,
      type: null,
      condition: {
        type: "feature",
        name: "width",
        value: {
          type: "range",
          minimum: {
            value: { type: "length", value: 100, unit: "px" },
            isInclusive: false,
          },
          maximum: {
            value: { type: "length", value: 500, unit: "px" },
            isInclusive: false,
          },
        },
      },
    },
  ]);
});

test(".parse() parses 0 in a length range as a dimensional bound", (t) => {
  t.deepEqual(parse("(0 < height < 500px)").getUnsafe().toJSON(), [
    {
      modifier: null,
      type: null,
      condition: {
        type: "feature",
        name: "height",
        value: {
          type: "range",
          minimum: {
            value: { type: "length", value: 0, unit: "px" },
            isInclusive: false,
          },
          maximum: {
            value: { type: "length", value: 500, unit: "px" },
            isInclusive: false,
          },
        },
      },
    },
  ]);
});

const smallPortrait /* smartphone */ = Device.of(
  Device.Type.Screen,
  Viewport.of(200, 400, Viewport.Orientation.Portrait),
  Display.of(300),
);

const width = 1280; // used for boundary tests
const largeLandscape /* desktop screen */ = Device.of(
  Device.Type.Screen,
  Viewport.of(width, 1080, Viewport.Orientation.Landscape),
  Display.of(90),
);

test("#matches() matches simple orientation query", (t) => {
  const isPortrait = parse("(orientation: portrait)").getUnsafe();

  t.deepEqual(isPortrait.matches(smallPortrait), true);
  t.deepEqual(isPortrait.matches(largeLandscape), false);
});

test("#matches() accepts any orientation in boolean context", (t) => {
  const isNone = parse("(orientation)").getUnsafe();

  t.deepEqual(isNone.matches(smallPortrait), true);
  t.deepEqual(isNone.matches(largeLandscape), true);
});

test("#matches() matches conjunction query", (t) => {
  const isLargeLandscape = parse(
    "(min-width: 640px) and (orientation: landscape)",
  ).getUnsafe();

  t.deepEqual(isLargeLandscape.matches(largeLandscape), true);
  t.deepEqual(isLargeLandscape.matches(smallPortrait), false);
});

test("#matches() matches disjunction query", (t) => {
  const isLargeOrPortrait = parse(
    "(min-width: 640px) or (orientation: portrait)",
  ).getUnsafe();

  t.deepEqual(isLargeOrPortrait.matches(largeLandscape), true);
  t.deepEqual(isLargeOrPortrait.matches(smallPortrait), true);
});

test("#matches() matches negation query", (t) => {
  const isNotLandscape = parse("not (orientation: landscape)").getUnsafe();

  t.deepEqual(isNotLandscape.matches(smallPortrait), true);
  t.deepEqual(isNotLandscape.matches(largeLandscape), false);
});

test("#matches() matches query with a media type", (t) => {
  const isScreenPortrait = parse(
    "screen and (orientation: portrait)",
  ).getUnsafe();

  const isPrintPortrait = parse(
    "print and (orientation: portrait)",
  ).getUnsafe();

  t.deepEqual(isScreenPortrait.matches(smallPortrait), true);
  t.deepEqual(isPrintPortrait.matches(smallPortrait), false);
  t.deepEqual(isScreenPortrait.matches(largeLandscape), false);
  t.deepEqual(isPrintPortrait.matches(largeLandscape), false);
});

test("#matches() disregards 'only' modifier", (t) => {
  const isScreenPortrait = parse(
    "only screen and (orientation: portrait)",
  ).getUnsafe();

  const isPrintPortrait = parse(
    "only print and (orientation: portrait)",
  ).getUnsafe();

  t.deepEqual(isScreenPortrait.matches(smallPortrait), true);
  t.deepEqual(isPrintPortrait.matches(smallPortrait), false);
  t.deepEqual(isScreenPortrait.matches(largeLandscape), false);
  t.deepEqual(isPrintPortrait.matches(largeLandscape), false);
});

test("#matches() honors 'not' modifier", (t) => {
  const isNotScreenPortrait = parse(
    "not screen and (orientation: portrait)",
  ).getUnsafe();

  const isNotPrintPortrait = parse(
    "not print and (orientation: portrait)",
  ).getUnsafe();

  t.deepEqual(isNotScreenPortrait.matches(smallPortrait), false);
  t.deepEqual(isNotPrintPortrait.matches(smallPortrait), true);
  t.deepEqual(isNotScreenPortrait.matches(largeLandscape), true);
  t.deepEqual(isNotPrintPortrait.matches(largeLandscape), true);
});

test("#matches() matches ranges", (t) => {
  const goldylocks /* not too small, not too big */ = Device.of(
    Device.Type.Screen,
    Viewport.of(500),
    Display.of(100),
  );

  const isGoldylocks = parse("(300px < width <= 600px)").getUnsafe();

  t.deepEqual(isGoldylocks.matches(smallPortrait), false);
  t.deepEqual(isGoldylocks.matches(goldylocks), true);
  t.deepEqual(isGoldylocks.matches(largeLandscape), false);
});

test("#matches() correctly behave at boundaries", (t) => {
  // Inclusive bound is matched inclusively
  const isLarge = parse(`(width >= ${width}px)`).getUnsafe();
  // Exclusive bound is matched exclusively
  const isSmall = parse(`(width < ${width}px)`).getUnsafe();
  // min- and max- bounds are matched inclusively
  const isLargeToo = parse(`(min-width: ${width}px)`).getUnsafe();

  t.deepEqual(isLarge.matches(largeLandscape), true);
  t.deepEqual(isSmall.matches(largeLandscape), false);
  t.deepEqual(isLargeToo.matches(largeLandscape), true);
});

test("#matches() matches boolean prefers-reduced-motion", (t) => {
  const prefersReducedMotion = parse("(prefers-reduced-motion)").getUnsafe();

  t.deepEqual(prefersReducedMotion.matches(smallPortrait), false);

  const withReducedMotion = Device.of(
    Device.Type.Screen,
    Viewport.of(200, 400, Viewport.Orientation.Portrait),
    Display.of(300),
    undefined,
    [Preference.of("prefers-reduced-motion", "reduce")],
  );

  t.deepEqual(prefersReducedMotion.matches(withReducedMotion), true);
});
