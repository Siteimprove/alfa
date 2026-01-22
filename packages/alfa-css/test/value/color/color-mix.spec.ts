import { Real } from "@siteimprove/alfa-math";
import { RNG } from "@siteimprove/alfa-rng";
import { test } from "@siteimprove/alfa-test";

import { Color } from "../../../dist/value/color/color.js";
import { ColorMix } from "../../../dist/value/color/color-mix.js";
import { CSS4Color, List, Percentage } from "../../../src/index.js";
import { MixItem } from "../../../src/value/color/mix.js";

import { color } from "../../common/color.js";
import { parser, serializer } from "../../common/parse.js";

const parse = parser(ColorMix.parse(Color.parse));
const serialize = serializer(ColorMix.parse(Color.parse));

const red = color(1, 0, 0);
const blue = color(0, 0, 1);

function mkColor(text: string): CSS4Color {
  return CSS4Color.of(text).getUnsafe();
}
function mkItem(text: string, percentage?: number): MixItem<CSS4Color> {
  return MixItem.of(
    mkColor(text),
    percentage === undefined ? undefined : Percentage.of(percentage),
  );
}

test(".parse() parses a color mix with two colors", (t) => {
  const mix = serialize("color-mix(in oklab, red 30%, blue)");

  t.deepEqual(mix, {
    type: "color-mix",
    space: "oklab",
    hueMethod: null,
    colors: {
      type: "list",
      values: [
        {
          type: "mix-item",
          value: red,
          percentage: { type: "percentage", value: 0.3 },
        },
        { type: "mix-item", value: blue, percentage: null },
      ],
      separator: ", ",
    },
  });
});

test(".parse() parses a color mix with various number of colors", (t) => {
  // Browsers seem to only support two colors, but the spec doesn't limit it.
  for (const input of [
    "color-mix(in oklab, red 25%, lime 25%, blue 25%, yellow 25%)",
    "color-mix(in oklab, red 50%, lime 25%, blue 25%)",
    "color-mix(in oklab, red 100%)",
  ]) {
    const mix = parse(input);
    t(mix.isOk());
  }
});

test(".parse() rejects a color mix with invalid percentages", (t) => {
  for (const input of [
    "color-mix(in oklab, red -10%, blue 10%)",
    "color-mix(in oklab, red 50%, blue 160%)",
  ]) {
    const mix = parse(input);
    t(mix.isErr());
  }
});

test(".parse() parses a color mix with hue method in polar space", (t) => {
  for (const space of ColorMix.polarSpaces) {
    for (const hueMethod of ColorMix.hueInterpolationMethods) {
      const input = `color-mix(in ${space} ${hueMethod} hue, red 50%, blue 50%)`;
      const mix = serialize(input);

      t.deepEqual(mix, {
        type: "color-mix",
        space,
        hueMethod,
        colors: {
          type: "list",
          values: [
            {
              type: "mix-item",
              value: red,
              percentage: { type: "percentage", value: 0.5 },
            },
            {
              type: "mix-item",
              value: blue,
              percentage: { type: "percentage", value: 0.5 },
            },
          ],
          separator: ", ",
        },
      });
    }
  }
});

test(".parse() rejects a color mix with hue method in rectangular space", (t) => {
  for (const space of ColorMix.rectangularSpaces) {
    for (const hueMethod of ColorMix.hueInterpolationMethods) {
      const input = `color-mix(in ${space} ${hueMethod} hue, red 50%, blue 50%)`;

      const mix = parse(input);
      t(mix.isErr());
    }
  }
});

test(".parse() uses 'shorter' as default hue interpolation method", (t) => {
  for (const space of ColorMix.polarSpaces) {
    const input = `color-mix(in ${space}, red 50%, blue 50%)`;
    const mix = serialize(input);

    t.deepEqual(mix, {
      type: "color-mix",
      space,
      hueMethod: "shorter",
      colors: {
        type: "list",
        values: [
          {
            type: "mix-item",
            value: red,
            percentage: { type: "percentage", value: 0.5 },
          },
          {
            type: "mix-item",
            value: blue,
            percentage: { type: "percentage", value: 0.5 },
          },
        ],
        separator: ", ",
      },
    });
  }
});

test(".parse() uses 'oklab' as default interpolation space", (t) => {
  // This is also not currently supported by browsers but specified that way.
  const input = `color-mix(red 50%, blue 50%)`;
  const mix = serialize(input);

  t.deepEqual(mix, {
    type: "color-mix",
    space: "oklab",
    hueMethod: null,
    colors: {
      type: "list",
      values: [
        {
          type: "mix-item",
          value: red,
          percentage: { type: "percentage", value: 0.5 },
        },
        {
          type: "mix-item",
          value: blue,
          percentage: { type: "percentage", value: 0.5 },
        },
      ],
      separator: ", ",
    },
  });
});

/*
 * The output of mix is often a "random" looking number, especially when switching
 * to another interpolation space. Moreover, the results differ after a few decimals
 * depending on the implementation (CSS spec example, colorjs.io, browsers, …)
 *
 * Given that the computation is done by colorjs.io, there is no real use for us
 * to test the actual return values. Instead, we just test some basic properties
 * that are within our control.
 */
test(".calculate() mixes two colors correctly", (t) => {
  const mix = List.of([mkItem("red", 0.25), mkItem("blue", 0.75)]);

  const result = ColorMix.calculate(mix, "srgb", "shorter");

  t.deepEqual(result.toJSON(), mkColor("rgb(25% 0 75%)").toJSON());
});

test(".calculate() normalizes percentages", (t) => {
  const mix = List.of([mkItem("red", 1), mkItem("blue", 3)]);

  const result = ColorMix.calculate(mix, "srgb", "shorter");

  t.deepEqual(result.toJSON(), mkColor("rgb(25% 0 75%)").toJSON());
});

test(".calculate() handles missing percentages", (t) => {
  const mix = List.of([mkItem("red", 0.5), mkItem("blue")]);

  const result = ColorMix.calculate(mix, "srgb", "shorter");

  t.deepEqual(result.toJSON(), mkColor("rgb(50% 0 50%)").toJSON());
});

test(".calculate() returns transparent black when all percentages are zero", (t) => {
  const mix = List.of([mkItem("red", 0), mkItem("blue", 0)]);

  const result = ColorMix.calculate(mix, "srgb", "shorter");

  t.deepEqual(result.toJSON(), mkColor("rgb(0% 0% 0% / 0)").toJSON());
});

test(".calculate() respects output space", (t) => {
  const mix = List.of([mkItem("red"), mkItem("blue")]);

  for (const space of ["srgb", "lab", "oklab", "lch", "hsl", "hwb"] as const) {
    const result = ColorMix.calculate(mix, space, "shorter");

    t.equal(result.color.space.id, space);
  }
});

test(".calculate() result depends on interpolation space", (t) => {
  // By mixing white and black, we should get different grays. Since grays have
  // the same rgb components, it is easy to test that they are indeed different,
  // while other mixes may randomly have the same r component but differ in g and b.
  const mix = List.of([mkItem("white"), mkItem("black")]);

  const srgbGray = ColorMix.calculate(mix, "srgb", "shorter");
  const labGray = ColorMix.calculate(mix, "lab", "shorter");
  const xyzGray = ColorMix.calculate(mix, "xyz", "shorter");

  t.notEqual(srgbGray.red.value, labGray.red.value);
  t.notEqual(srgbGray.red.value, xyzGray.red.value);
  t.notEqual(labGray.red.value, xyzGray.red.value);
  t.notEqual(srgbGray.green.value, labGray.green.value);
  t.notEqual(srgbGray.green.value, xyzGray.green.value);
  t.notEqual(labGray.green.value, xyzGray.green.value);
  t.notEqual(srgbGray.blue.value, labGray.blue.value);
  t.notEqual(srgbGray.blue.value, xyzGray.blue.value);
  t.notEqual(labGray.blue.value, xyzGray.blue.value);
});

test(
  ".calculate() result depends on hue interpolation method",
  (t, rng) => {
    const [a, b] = rng.rand();

    const mix = List.of([
      mkItem(`hsl(${a}deg, 1, 1)`),
      mkItem(`hsl(${b}deg, 1, 1)`),
    ]);

    const shorter = ColorMix.calculate(mix, "hsl", "shorter");
    const longer = ColorMix.calculate(mix, "hsl", "longer");
    const increasing = ColorMix.calculate(mix, "hsl", "increasing");
    const decreasing = ColorMix.calculate(mix, "hsl", "decreasing");

    t.equal(
      shorter.color.h,
      // https://www.w3.org/TR/css-color-4/#hue-shorter
      b - a > 180 || b - a < -180 ? (a + b + 360) / 2 : (a + b) / 2,
      `Failed with shorter hue from ${a}deg to ${b}deg); seed: ${rng.seed}, iteration: ${rng.iterations}`,
    );
    t.equal(
      longer.color.h,
      // https://www.w3.org/TR/css-color-4/#hue-longer
      (b - a > 0 && b - a < 180) || (b - a <= 0 && b - a > -180)
        ? (a + b + 360) / 2
        : (a + b) / 2,
      `Failed with longer hue from ${a}deg to ${b}deg; seed: ${rng.seed}, iteration: ${rng.iterations}`,
    );
    // counter-clockwise from a to b
    t.equal(
      increasing.color.h,
      // https://www.w3.org/TR/css-color-4/#hue-increasing
      b < a ? (a + b + 360) / 2 : (a + b) / 2,
      `Failed with increasing hue from ${a}deg to ${b}deg; seed: ${rng.seed}, iteration: ${rng.iterations}`,
    );
    // clockwise from a to b
    t.equal(
      decreasing.color.h,
      // https://www.w3.org/TR/css-color-4/#hue-decreasing
      a < b ? (a + b + 360) / 2 : (a + b) / 2,
      `Failed with decreasing hue from ${a}deg to ${b}deg; seed: ${rng.seed}, iteration: ${rng.iterations}`,
    );
  },
  {
    rng: RNG.integer(360).group(2).create(),
  },
);

test(".calculate() adds transparency when mix percentages do not add up to 100%", (t) => {
  const mix = List.of([mkItem("red", 0.6), mkItem("blue", 0.2)]);

  const result = ColorMix.calculate(mix, "srgb", "shorter");

  t.deepEqual(result.toJSON(), mkColor("rgb(75% 0 25% / 80%)").toJSON());
});
