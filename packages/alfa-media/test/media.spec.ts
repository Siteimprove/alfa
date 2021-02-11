/// <reference lib="dom" />

import { test } from "@siteimprove/alfa-test";

import { Media } from "../src";

test("parse() parses '(orientation: portrait)'", (t) => {
  t.deepEqual(Media.parse("(orientation: portrait)").get().toJSON(), [
    {
      type: "query",
      modifier: null,
      mediaType: null,
      condition: {
        type: "feature",
        name: "orientation",
        value: {
          type: "string",
          value: "portrait",
        },
      },
    },
  ]);
});

test("parse() parses 'screen, (orientation: landscape) and ((max-width: 640px) or (not (min-height: 100px)))'", (t) => {
  t.deepEqual(
    Media.parse(
      "screen, (orientation: landscape) and ((max-width: 640px) or (not (min-height: 100px)))"
    )
      .get()
      .toJSON(),
    [
      {
        type: "query",
        modifier: null,
        mediaType: { type: "type", name: "screen" },
        condition: null,
      },
      {
        type: "query",
        modifier: null,
        mediaType: null,
        condition: {
          type: "condition",
          combinator: "and",
          left: {
            type: "feature",
            name: "orientation",
            value: { type: "string", value: "landscape" },
          },
          right: {
            type: "condition",
            combinator: "or",
            left: {
              type: "feature",
              name: "max-width",
              value: { type: "length", value: 640, unit: "px" },
            },
            right: {
              type: "negation",
              condition: {
                type: "feature",
                name: "min-height",
                value: { type: "length", value: 100, unit: "px" },
              },
            },
          },
        },
      },
    ]
  );
});

test("parse() parses 'screen and (orientation: portrait) and (min-width: 100px)", (t) => {
  t.deepEqual(
    Media.parse("screen and (orientation: portrait) and (min-width: 100px)")
      .get()
      .toJSON()[0],
    {
      type: "query",
      modifier: null,
      mediaType: { type: "type", name: "screen" },
      condition: {
        type: "condition",
        combinator: "and",
        left: {
          type: "feature",
          name: "orientation",
          value: { type: "string", value: "portrait" },
        },
        right: {
          type: "feature",
          name: "min-width",
          value: { type: "length", value: 100, unit: "px" },
        },
      },
    }
  );
});

test("parse() fails to parse 'screen and (orientation: portrait) or (min-width: 100px)", (t) => {
  t.deepEqual(
    Media.parse(
      "screen and (orientation: portrait) or (min-width: 100px)"
    ).isNone(),
    true
  );
});
