import { test } from "@siteimprove/alfa-test";

import { Color } from "../../../dist/value/color/color.js";
import { ColorMix } from "../../../dist/value/color/color-mix.js";

import { color } from "../../common/color.js";
import { parser, serializer } from "../../common/parse.js";

const parse = parser(ColorMix.parse(Color.parse));
const serialize = serializer(ColorMix.parse(Color.parse));

const red = color(1, 0, 0);
const lime = color(0, 1, 0);
const blue = color(0, 0, 1);
const yellow = color(1, 1, 0);

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
