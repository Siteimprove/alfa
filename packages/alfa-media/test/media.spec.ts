import { test } from "@siteimprove/alfa-test";

import { Lexer } from "@siteimprove/alfa-css";

import { Media } from "../src";

function parse(input: string) {
  return Media.parse(Lexer.lex(input)).map(([, query]) => query);
}

test(".parse() parses a simple query", (t) => {
  t.deepEqual(parse("(orientation: portrait)").get().toJSON(), [
    {
      modifier: null,
      type: null,
      condition: {
        type: "feature",
        name: "orientation",
        value: {
          type: "discrete",
          value: {
            type: "keyword",
            value: "portrait",
          },
        },
      },
    },
  ]);
});

test(".parse() parses a list of queries", (t) => {
  t.deepEqual(
    parse(
      "screen, (orientation: landscape) and ((max-width: 640px) or (not (min-height: 100px)))"
    )
      .get()
      .toJSON(),
    [
      {
        modifier: null,
        type: {
          name: "screen",
        },
        condition: null,
      },
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
              value: {
                type: "keyword",
                value: "landscape",
              },
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
                  value: {
                    type: "length",
                    value: 640,
                    unit: "px",
                  },
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
                    value: {
                      type: "length",
                      value: 100,
                      unit: "px",
                    },
                    isInclusive: true,
                  },
                  maximum: null,
                },
              },
            },
          },
        },
      },
    ]
  );
});

test(".parse() parses a list of mixed type and feature queries", (t) => {
  t.deepEqual(
    parse("screen and (orientation: portrait) and (min-width: 100px)")
      .get()
      .toJSON(),
    [
      {
        modifier: null,
        type: {
          name: "screen",
        },
        condition: {
          type: "and",
          left: {
            type: "feature",
            name: "orientation",
            value: {
              type: "discrete",
              value: {
                type: "keyword",
                value: "portrait",
              },
            },
          },
          right: {
            type: "feature",
            name: "width",
            value: {
              type: "range",
              minimum: {
                value: {
                  type: "length",
                  value: 100,
                  unit: "px",
                },
                isInclusive: true,
              },
              maximum: null,
            },
          },
        },
      },
    ]
  );
});

test(".parse() does not create a modifier in the absence of a type", (t) => {
  t.deepEqual(parse("not screen and (orientation: landscape)").get().toJSON(), [
    {
      modifier: "not",
      type: {
        name: "screen",
      },
      condition: {
        type: "feature",
        name: "orientation",
        value: {
          type: "discrete",
          value: {
            type: "keyword",
            value: "landscape",
          },
        },
      },
    },
  ]);

  t.deepEqual(parse("not (orientation: landscape)").get().toJSON(), [
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
            value: {
              type: "keyword",
              value: "landscape",
            },
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
    t.deepEqual(parse(`${input}`).get().toJSON(), [
      {
        modifier: "not",
        type: {
          name: "all",
        },
        condition: null,
      },
    ]);
  });
}

test(`.parse() only drops invalid queries in a list, but leaves valid queries`, (t) => {
  t.deepEqual(parse("(max-weight: 3px), (width: 100px)").get().toJSON(), [
    {
      modifier: "not",
      type: {
        name: "all",
      },
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
          value: {
            type: "length",
            value: 100,
            unit: "px",
          },
        },
      },
    },
  ]);
});

test(".parse() accepts unknown media types", (t) => {
  t.deepEqual(parse("unknown").get().toJSON(), [
    {
      modifier: null,
      type: {
        name: "unknown",
      },
      condition: null,
    },
  ]);
});

test(".parse() parses a value < feature range", (t) => {
  t.deepEqual(parse("(100px < width)").get().toJSON(), [
    {
      modifier: null,
      type: null,
      condition: {
        type: "feature",
        name: "width",
        value: {
          type: "range",
          minimum: {
            value: {
              type: "length",
              value: 100,
              unit: "px",
            },
            isInclusive: false,
          },
          maximum: null,
        },
      },
    },
  ]);
});

test(".parse() parses a feature > value range", (t) => {
  t.deepEqual(parse("(width > 100px)").get().toJSON(), [
    {
      modifier: null,
      type: null,
      condition: {
        type: "feature",
        name: "width",
        value: {
          type: "range",
          minimum: {
            value: {
              type: "length",
              value: 100,
              unit: "px",
            },
            isInclusive: false,
          },
          maximum: null,
        },
      },
    },
  ]);
});

test(".parse() parses a feature > 0 as adimensional bound", (t) => {
  t.deepEqual(parse("(width > 0)").get().toJSON(), [
    {
      modifier: null,
      type: null,
      condition: {
        type: "feature",
        name: "width",
        value: {
          type: "range",
          minimum: {
            value: {
              type: "length",
              value: 0,
              unit: "px",
            },
            isInclusive: false,
          },
          maximum: null,
        },
      },
    },
  ]);
});

test(".parse() parses a value < feature < value range", (t) => {
  t.deepEqual(parse("(100px < width < 500px)").get().toJSON(), [
    {
      modifier: null,
      type: null,
      condition: {
        type: "feature",
        name: "width",
        value: {
          type: "range",
          minimum: {
            value: {
              type: "length",
              value: 100,
              unit: "px",
            },
            isInclusive: false,
          },
          maximum: {
            value: {
              type: "length",
              value: 500,
              unit: "px",
            },
            isInclusive: false,
          },
        },
      },
    },
  ]);
});

test(".parse() parses a value range with an adimensional bound", (t) => {
  t.deepEqual(parse("(0 < height < 500px)").get().toJSON(), [
    {
      modifier: null,
      type: null,
      condition: {
        type: "feature",
        name: "height",
        value: {
          type: "range",
          minimum: {
            value: {
              type: "length",
              value: 0,
              unit: "px",
            },
            isInclusive: false,
          },
          maximum: {
            value: {
              type: "length",
              value: 500,
              unit: "px",
            },
            isInclusive: false,
          },
        },
      },
    },
  ]);
});
