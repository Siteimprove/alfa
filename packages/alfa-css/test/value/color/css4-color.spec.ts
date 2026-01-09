/*
 * Given that the CSS4 color parser mostly uses the colorjs.io library,
 * we mostly have surface level tests that integration works as expected.
 *
 * This does not include extensive tests of many scenarios. This does not
 * include extensive tests of the results of parsing, just checking that it works.
 */
import { test } from "@siteimprove/alfa-test";

import { ColorFoo } from "../../../dist/value/color/css4-color.js";

import { parser, parserUnsafe } from "../../common/parse.js";

const parse = parserUnsafe(ColorFoo.parse);
const parseErr = parser(ColorFoo.parse);

test(".parse() correctly parses basic colors", (t) => {
  for (const color of ["#f00", "red", "rgb(255, 0, 0)"]) {
    const actual = parse(color);

    t.deepEqual(actual.toJSON(), {
      type: "color",
      space: "srgb",
      coordinates: [1, 0, 0],
      sRGB: [1, 0, 0],
      alpha: { type: "number", value: 1 },
    });
  }
});

test(".parse() graciously rejects invalid colors", (t) => {
  for (const color of [
    "#12",
    "#12345",
    "not-a-color",
    "rgb(300, 0)",
    "hsl(0 100% 50% 1.5 10)",
    "color(invalid 1 0 0)",
    "lab(50 0)",
  ]) {
    t(parseErr(color).isErr(), `Expected parsing "${color}" to fail`);
  }
});

test(".parse()parses various colors format", (t) => {
  for (const color of [
    "#f00",
    "red",
    "rgb(255, 0, 0)",
    "rgba(100% 0 0% /0.5)",
    "hsl(0 100% 50%)",
    "hsla(0 100% 50% / 0.2)",
    "color(srgb 1 0 0 / 0.3)",
    "color(display-p3 1 0 0)",
    "color(rec2020 1 0 0 / 0.8)",
    "color(prophoto-rgb 1 0 0)",
    "lab(53.23288 80.10933 67.22006)",
    "lch(53.23288 104.5525 39.99787)",
    "oklab(0.62796 0.22486 0.12558)",
    "oklch(0.62796 0.25619 29.23495)",
  ]) {
    t(parseErr(color).isOk(), `Expected parsing "${color}" to succeed`);
  }
});
