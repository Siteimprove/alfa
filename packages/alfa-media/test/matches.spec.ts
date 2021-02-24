import { test } from "@siteimprove/alfa-test";

import { Lexer } from "@siteimprove/alfa-css";
import { Device, Display, Viewport } from "@siteimprove/alfa-device";

import { Media } from "../src";

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

function parse(input: string) {
  return Media.parse(Lexer.lex(input)).map(([, query]) => query);
}

test(".matches() matches simple orientation query", (t) => {
  const isPortrait = parse("(orientation: portrait)").get();

  t.deepEqual(isPortrait.matches(smallPortrait), true);
  t.deepEqual(isPortrait.matches(largeLandscape), false);
});

test(".matches() matches conjunction query", (t) => {
  const isLargeLandscape = parse(
    "(min-width: 640px) and (orientation: landscape)"
  ).get();

  t.deepEqual(isLargeLandscape.matches(largeLandscape), true);
  t.deepEqual(isLargeLandscape.matches(smallPortrait), false);
});

test(".matches() matches disjunction query", (t) => {
  const isLargeOrPortrait = parse(
    "(min-width: 640px) or (orientation: portrait)"
  ).get();

  t.deepEqual(isLargeOrPortrait.matches(largeLandscape), true);
  t.deepEqual(isLargeOrPortrait.matches(smallPortrait), true);
});

test(".matches() matches negation query", (t) => {
  const isNotLandscape = parse("not (orientation: landscape)").get();

  t.deepEqual(isNotLandscape.matches(smallPortrait), true);
  t.deepEqual(isNotLandscape.matches(largeLandscape), false);
});

test(".matches() matches query with a media type", (t) => {
  const isScreenPortrait = parse("screen and (orientation: portrait)").get();
  const isPrintPortrait = parse("print and (orientation: portrait)").get();

  t.deepEqual(isScreenPortrait.matches(smallPortrait), true);
  t.deepEqual(isPrintPortrait.matches(smallPortrait), false);
  t.deepEqual(isScreenPortrait.matches(largeLandscape), false);
  t.deepEqual(isPrintPortrait.matches(largeLandscape), false);
});

test(".matches() disregards 'only' modifier", (t) => {
  const isScreenPortrait = parse(
    "only screen and (orientation: portrait)"
  ).get();
  const isPrintPortrait = parse("only print and (orientation: portrait)").get();

  t.deepEqual(isScreenPortrait.matches(smallPortrait), true);
  t.deepEqual(isPrintPortrait.matches(smallPortrait), false);
  t.deepEqual(isScreenPortrait.matches(largeLandscape), false);
  t.deepEqual(isPrintPortrait.matches(largeLandscape), false);
});

test(".matches() honors 'not' modifier", (t) => {
  const isNotScreenPortrait = parse(
    "not screen and (orientation: portrait)"
  ).get();
  const isNotPrintPortrait = parse(
    "not print and (orientation: portrait)"
  ).get();

  t.deepEqual(isNotScreenPortrait.matches(smallPortrait), false);
  t.deepEqual(isNotPrintPortrait.matches(smallPortrait), true);
  t.deepEqual(isNotScreenPortrait.matches(largeLandscape), true);
  t.deepEqual(isNotPrintPortrait.matches(largeLandscape), true);
});

test(".matches() matches ranges", (t) => {
  const goldylocks /* not too small, not too big */ = Device.of(
    Device.Type.Screen,
    Viewport.of(500),
    Display.of(100)
  );

  const isGoldylocks = parse("(300px < width <= 600px)").get();

  t.deepEqual(isGoldylocks.matches(smallPortrait), false);
  t.deepEqual(isGoldylocks.matches(goldylocks), true);
  t.deepEqual(isGoldylocks.matches(largeLandscape), false);
});
