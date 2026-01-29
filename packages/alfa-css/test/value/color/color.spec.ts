import { Selective } from "@siteimprove/alfa-selective";
import { test } from "@siteimprove/alfa-test";

import { Color } from "../../../dist/value/color/color.js";

import { color } from "../../common/color.js";
import { parser } from "../../common/parse.js";

const parse = parser(Color.parse);

// Here, we globally don't care about the exact actual values, since most of the
// tested function simply dispatch to the individual ones.

const black = Color.of("black").getUnsafe();
const white = Color.of("white").getUnsafe();
const red = Color.of("red").getUnsafe();
const lime = Color.of("lime").getUnsafe();
const blue = Color.of("blue").getUnsafe();

const colors = [
  "#f00",
  "rgb(255, 0, 0)",
  "hsla(0, 100%, 50%, 1)",
  "red",
  "oklch(53.24% 40 0deg / 1)",
  "color(display-p3 1 0 0 / .6)",
  "lab(54.29% 80.81 69.89 / 1)",
  "currentcolor",
  "currentColor",
  "buttonText",
  "color-mix(in srgb, red 50%, blue 50%)",
  "color-mix(in srgb, red 50%, color-mix(in srgb, blue 50%, lime 50%))",
  "color-mix(in srgb, red 50%, color-mix(in srgb, blue 50%, currentColor))",
];

test(".parse() parses various color formats", (t) => {
  for (const input of colors) {
    t(parse(input).isOk(), `Could not parse "${input}"`);
  }
});

test(".partiallyResolve() resolves anything without a currentColor", (t) => {
  const hasCurrentColor = (input: string) =>
    input.toLocaleLowerCase().includes("currentcolor");
  const isCurrentColor = (input: string) =>
    input.toLocaleLowerCase() === "currentcolor";

  for (const input of colors) {
    const color = parse(input).getUnsafe();
    const partiallyResolved = Color.partiallyResolve(color);

    t(
      Selective.of(input)
        .if(isCurrentColor, () => Color.isCurrent(partiallyResolved))
        .if(hasCurrentColor, () => Color.isColorMix(partiallyResolved))
        .else(() => Color.isCSS4Color(partiallyResolved))
        .get(),
      `Failed to partially resolve ${input}`,
    );
  }
});

test(".resolve() resolves anything", (t) => {
  for (const input of colors) {
    const color = parse(input).getUnsafe();
    const resolved = Color.resolve({ currentColor: black })(color);

    t(Color.isCSS4Color(resolved), `Failed to partially resolve ${input}`);
  }
});

test(".composite() ignore background when foreground is fully opaque", (t) => {
  for (const bg of [black, white, red, lime, blue]) {
    for (const fg of [black, white, red, lime, blue]) {
      const composite = Color.composite(fg, bg, 1);

      t.deepEqual(
        composite.toJSON(),
        fg.toJSON(),
        `Failed to composite ${fg} over ${bg}`,
      );
    }
  }
});

test(".composite() applies opacity to fully opaque foreground", (t) => {
  for (const bg of [black, white, red, lime, blue]) {
    for (const fg of [black, white, red, lime, blue]) {
      for (const alpha of [0, 0.25, 0.5, 0.75, 1]) {
        const composite = Color.composite(fg, bg, alpha);

        t.deepEqual(
          composite.toJSON(),
          color(
            fg.red.value * alpha + bg.red.value * (1 - alpha),
            fg.green.value * alpha + bg.green.value * (1 - alpha),
            fg.blue.value * alpha + bg.blue.value * (1 - alpha),
            1,
          ),
          `Failed to composite ${fg} over ${bg} with opacity ${alpha}`,
        );
      }
    }
  }
});

test(".composite() correctly resolve partially transparent foreground", (t) => {
  for (const bg of [black, white, red, lime, blue]) {
    for (const fg of [black, white, red, lime, blue]) {
      for (const alpha of [0, 0.25, 0.5, 0.75, 1]) {
        const composite = Color.composite(fg.withAlpha(alpha), bg, 1);

        t.deepEqual(
          composite.toJSON(),
          color(
            fg.red.value * alpha + bg.red.value * (1 - alpha),
            fg.green.value * alpha + bg.green.value * (1 - alpha),
            fg.blue.value * alpha + bg.blue.value * (1 - alpha),
            1,
          ),
          `Failed to composite ${fg} with opacity ${alpha} over ${bg}`,
        );
      }
    }
  }
});

test(".composite() correctly resolve complex compositions", (t) => {
  // For this test, we stop doing some semi-exhaustive testing, because
  // otherwise the test code starts to look like the implementation…

  t.deepEqual(
    Color.composite(red.withAlpha(0.25), blue.withAlpha(0.5), 0.5).toJSON(),
    color(
      /* fg alpha */ 0.25 * /* opacity */ 0.5, // 0.125
      0,
      /* bg alpha */ 0.5 * (1 - /* fg alpha */ 0.25 * /* opacity */ 0.5), // 0.4375
      /* final fg opacity */ 0.125 + /* final bg opacity */ 0.4375,
    ),
  );
});

test("Transparent colors are transparent", (t) => {
  for (const color of [
    Color.transparent,
    Color.of("rgba(0, 0, 0, 0)").getUnsafe(),
    Color.of("color(srgb 1 1 1 / 0)").getUnsafe(),
    Color.of("red").getUnsafe().withAlpha(0),
  ]) {
    t(Color.isTransparent(color), `Failed to identify ${color} as transparent`);
  }
});

test("Non-transparent colors are not transparent", (t) => {
  for (const color of [
    Color.of("black").getUnsafe(),
    Color.of("rgba(0, 0, 0, 0.1)").getUnsafe(),
    Color.of("color(srgb 1 1 1 / 0.0001)").getUnsafe(),
    Color.of("red").getUnsafe().withAlpha(1),
  ]) {
    t(
      !Color.isTransparent(color),
      `Incorrectly identified ${color} as transparent`,
    );
  }
});

test("Color mixes with only transparent or 0% items are transparent", (t) => {
  for (const input of [
    "color-mix(in srgb, red 0%, currentColor 0%)",
    "color-mix(in srgb, currentColor 0%, rgba(0,0,0,0) 100%)",
  ]) {
    const color = parse(input).getUnsafe();
    t(Color.isTransparent(color), `Failed to identify ${input} as transparent`);
  }
});

test("Color mixes with non-transparent or non-0% items are not transparent", (t) => {
  for (const input of [
    "color-mix(in srgb, currentColor 0%, blue 1%)",
    "color-mix(in srgb, currentColor 0%, currentColor 1%)",
    "color-mix(in srgb, red 0%, blue)",
    "color-mix(in srgb, red 0%, rgba(0,0,0,0.1) 100%)",
  ]) {
    const color = parse(input).getUnsafe();
    t(
      !Color.isTransparent(color),
      `Incorrectly identified ${input} as transparent`,
    );
  }
});
