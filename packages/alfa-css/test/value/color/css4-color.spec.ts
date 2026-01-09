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
    t(parseErr(color).isErr(), `Expected parsing "${color}" to fail.`);
  }
});

test(".parse() parses various color formats", (t) => {
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
    t(parseErr(color).isOk(), `Expected parsing "${color}" to succeed.`);
  }
});

test(".parse() parses various color formats with calculations", (t) => {
  for (const color of [
    "rgb(255, 0, calc(10 + 10))",
    "rgba(calc(10% * 2) 0 0% /0.5)",
    "hsl(calc(10 - 5) 100% 50%)",
    "hsla(calc(20deg + 1rad) 100% 50% / 0.2)",
    "color(srgb 1 0 calc(1 / 2) / 0.3)",
    "color(display-p3 calc(20% + 10%) 0 0)",
    "color(rec2020 1 0 calc(0 - 0) / 0.8)",
    "lab(calc(20 * 2) 80.10933 67.22006)",
    "lch(53.23288 104.5525 calc(10deg + 20deg))",
  ]) {
    t(parseErr(color).isOk(), `Expected parsing "${color}" to succeed.`);
  }
});

test(".parse() graciously rejects various color formats with incorrect calculations", (t) => {
  // Mixing types in the calculation, e.g. using an <angle-number> when hue
  // expects an <angle> | <number>
  for (const color of [
    "rgb(255, 0, calc(10 + 10%))",
    "hsl(calc(10% - 5) 100% 50%)",
    "color(display-p3 calc(20% + 10) 0 0)",
    "lab(calc(20 * 2 + 1%) 80.10933 67.22006)",
  ]) {
    t(parseErr(color).isErr(), `Expected parsing "${color}" to fail.`);
  }
});
