/// <reference lib="dom" />

import { test } from "@siteimprove/alfa-test";

import { Lexer } from "@siteimprove/alfa-css";
import {
  Device,
  Viewport,
  Display,
  Preference,
} from "@siteimprove/alfa-device";

import { Feature } from "../src";

const names = Object.keys(Preference.preferences) as Array<Preference.Name>;

function parse(input: string) {
  return Feature.parseMediaQuery(Lexer.lex(input))
    .map(([, query]) => query)
    .getUnsafe()
    .toJSON();
}

test("Valid user preferences queries are parsed", (t) => {
  for (const preference of names) {
    for (const value of Preference.preferences[preference]) {
      t.deepEqual(parse(`(${preference}: ${value})`), [
        {
          modifier: null,
          type: null,
          condition: {
            type: "feature",
            name: preference,
            value: {
              type: "discrete",
              value: { type: "keyword", value: value },
            },
          },
        },
      ]);
    }
  }
});

test("Boolean user preferences queries are parsed", (t) => {
  for (const preference of names) {
    t.deepEqual(parse(`(${preference})`), [
      {
        modifier: null,
        type: null,
        condition: { type: "feature", name: preference, value: null },
      },
    ]);
  }
});

test("Invalid user preferences queries are not parsed", (t) => {
  for (const preference of names) {
    t.deepEqual(parse(`(${preference}: foo)`), [
      {
        modifier: "not",
        type: { name: "all" },
        condition: null,
      },
    ]);
  }
});
