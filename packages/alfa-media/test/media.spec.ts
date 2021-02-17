import { test } from "@siteimprove/alfa-test";

import { Lexer } from "@siteimprove/alfa-css";

import { Media } from "../src";

function parse(input: string) {
  return Media.parse(Lexer.lex(input)).map(([, query]) => query.toJSON());
}

test(".parse() parses a simple query", (t) => {
  t.deepEqual(parse("(orientation: portrait)").get(), [
    {
      modifier: null,
      type: null,
      condition: {
        type: "feature",
        name: "orientation",
        value: {
          type: "discrete",
          value: {
            type: "string",
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
    ).get(),
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
          type: "condition",
          combinator: "and",
          left: {
            type: "feature",
            name: "orientation",
            value: {
              type: "discrete",
              value: {
                type: "string",
                value: "landscape",
              },
            },
          },
          right: {
            type: "condition",
            combinator: "or",
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
              type: "negation",
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
    parse("screen and (orientation: portrait) and (min-width: 100px)").get(),
    [
      {
        modifier: null,
        type: {
          name: "screen",
        },
        condition: {
          type: "condition",
          combinator: "and",
          left: {
            type: "feature",
            name: "orientation",
            value: {
              type: "discrete",
              value: {
                type: "string",
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
  t.deepEqual(parse("not screen and (orientation: landscape)").get(), [
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
            type: "string",
            value: "landscape",
          },
        },
      },
    },
  ]);

  t.deepEqual(parse("not (orientation: landscape)").get(), [
    {
      modifier: null,
      type: null,
      condition: {
        type: "negation",
        condition: {
          type: "feature",
          name: "orientation",
          value: {
            type: "discrete",
            value: {
              type: "string",
              value: "landscape",
            },
          },
        },
      },
    },
  ]);
});

test(".parse() does not parse a list that mixes combinators", (t) => {
  t.deepEqual(
    parse("screen and (orientation: portrait) or (min-width: 100px)").isErr(),
    true
  );
});
