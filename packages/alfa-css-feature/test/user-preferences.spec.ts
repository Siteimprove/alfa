/// <reference lib="dom" />

import { Lexer } from "@siteimprove/alfa-css";
import {
  Device,
  Display,
  Preference,
  Scripting,
  Viewport,
} from "@siteimprove/alfa-device";
import { test } from "@siteimprove/alfa-test";

import { Feature } from "../src";
import Type = Device.Type;

const names = Object.keys(Preference.preferences) as Array<Preference.Name>;

function parse(input: string) {
  return Feature.parseMediaQuery(Lexer.lex(input))
    .map(([, query]) => query)
    .getUnsafe();
}

test("Valid user preferences queries are parsed", (t) => {
  for (const preference of names) {
    for (const value of Preference.preferences[preference]) {
      t.deepEqual(parse(`(${preference}: ${value})`).toJSON(), [
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
    t.deepEqual(parse(`(${preference})`).toJSON(), [
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
    t.deepEqual(parse(`(${preference}: invalid)`).toJSON(), [
      {
        modifier: "not",
        type: { name: "all" },
        condition: null,
      },
    ]);
  }
});

function colorPref(value: Preference.Value<"prefers-color-scheme">): Device {
  return Device.of(
    Type.Screen,
    Viewport.of(1920, 1080),
    Display.of(100),
    Scripting.of(true),
    [Preference.of("prefers-color-scheme", value)],
  );
}

const devices = {
  light: colorPref("light"),
  dark: colorPref("dark"),
  "no-preference": colorPref("no-preference"),
};
const keys = Object.keys(devices) as Array<keyof typeof devices>;

test("#matches() matches simple color preference queries", (t) => {
  for (const color of keys) {
    for (const device of keys) {
      t.equal(
        parse(`(prefers-color-scheme: ${color})`).matches(devices[device]),
        color === device,
      );
    }
  }
});

test("#matches() doesn't match 'no-preference' in boolean context", (t) => {
  for (const device of keys) {
    t.equal(
      parse(`(prefers-color-scheme)`).matches(devices[device]),
      device !== "no-preference",
    );
  }
});
