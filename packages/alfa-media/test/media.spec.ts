/// <reference lib="dom" />

import { test } from "@siteimprove/alfa-test";

import { Media } from "../src";
import { Device, Display, Viewport } from "@siteimprove/alfa-device";

const smallPortrait /* smartphone */ = Device.of(
  Device.Type.Screen,
  Viewport.of(200, 400, Viewport.Orientation.Portrait),
  Display.of(300)
);

const largeLandscape /* desktop screen */ = Device.of(
  Device.Type.Screen,
  Viewport.of(1280, 1080, Viewport.Orientation.Landscape),
  Display.of(90)
);

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
          type: "expression",
          combinator: "and",
          left: {
            type: "feature",
            name: "orientation",
            value: { type: "string", value: "landscape" },
          },
          right: {
            type: "expression",
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
        type: "expression",
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

test("parse() does not create modifier in the absence of type", (t) => {
  t.deepEqual(
    Media.parse("not screen and (orientation: landscape)").get().toJSON()[0],
    {
      type: "query",
      modifier: "not",
      mediaType: { type: "type", name: "screen" },
      condition: {
        type: "feature",
        name: "orientation",
        value: { type: "string", value: "landscape" },
      },
    }
  );

  t.deepEqual(Media.parse("not (orientation: landscape)").get().toJSON()[0], {
    type: "query",
    modifier: null,
    mediaType: null,
    condition: {
      type: "negation",
      condition: {
        type: "feature",
        name: "orientation",
        value: { type: "string", value: "landscape" },
      },
    },
  });
});

test("parse() fails to parse 'screen and (orientation: portrait) or (min-width: 100px)", (t) => {
  t.deepEqual(
    Media.parse(
      "screen and (orientation: portrait) or (min-width: 100px)"
    ).isNone(),
    true
  );
});

test("matches() matches simple orientation query", (t) => {
  const isPortrait = Media.parse("(orientation: portrait)").get();

  t.deepEqual(isPortrait.matches(smallPortrait), true);
  t.deepEqual(isPortrait.matches(largeLandscape), false);
});

test("matches() matches conjunction query", (t) => {
  const isLargeLandscape = Media.parse(
    "(min-width: 640px) and (orientation: landscape)"
  ).get();

  t.deepEqual(isLargeLandscape.matches(largeLandscape), true);
  t.deepEqual(isLargeLandscape.matches(smallPortrait), false);
});

test("matches() matches disjunction query", (t) => {
  const isLargeOrPortrait = Media.parse(
    "(min-width: 640px) or (orientation: portrait)"
  ).get();

  t.deepEqual(isLargeOrPortrait.matches(largeLandscape), true);
  t.deepEqual(isLargeOrPortrait.matches(smallPortrait), true);
});

test("matches() matches negation query", (t) => {
  const isNotLandscape = Media.parse("not (orientation: landscape)").get();

  t.deepEqual(isNotLandscape.matches(smallPortrait), true);
  t.deepEqual(isNotLandscape.matches(largeLandscape), false);
});

test("matches() matches query with a media type", (t) => {
  const isScreenPortrait = Media.parse(
    "screen and (orientation: portrait)"
  ).get();
  const isPrintPortrait = Media.parse(
    "print and (orientation: portrait)"
  ).get();

  t.deepEqual(isScreenPortrait.matches(smallPortrait), true);
  t.deepEqual(isPrintPortrait.matches(smallPortrait), false);
  t.deepEqual(isScreenPortrait.matches(largeLandscape), false);
  t.deepEqual(isPrintPortrait.matches(largeLandscape), false);
});

test("matches() disregards 'only' modifier", (t) => {
  const isScreenPortrait = Media.parse(
    "only screen and (orientation: portrait)"
  ).get();
  const isPrintPortrait = Media.parse(
    "only print and (orientation: portrait)"
  ).get();

  t.deepEqual(isScreenPortrait.matches(smallPortrait), true);
  t.deepEqual(isPrintPortrait.matches(smallPortrait), false);
  t.deepEqual(isScreenPortrait.matches(largeLandscape), false);
  t.deepEqual(isPrintPortrait.matches(largeLandscape), false);
});

test("matches() honors 'not' modifier", (t) => {
  const isNotScreenPortrait = Media.parse(
    "not screen and (orientation: portrait)"
  ).get();
  const isNotPrintPortrait = Media.parse(
    "not print and (orientation: portrait)"
  ).get();

  t.deepEqual(isNotScreenPortrait.matches(smallPortrait), false);
  t.deepEqual(isNotPrintPortrait.matches(smallPortrait), true);
  t.deepEqual(isNotScreenPortrait.matches(largeLandscape), true);
  t.deepEqual(isNotPrintPortrait.matches(largeLandscape), true);
});
