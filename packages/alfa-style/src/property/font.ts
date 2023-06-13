import { Token, Keyword } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Longhand } from "../longhand";
import { Shorthand } from "../shorthand";

import LineHeight from "./line-height";
import Family from "./font-family";
import Size from "./font-size";
// Only keyword stretch are accepted in font, so we need to import the correct parser
import * as Stretch from "./font-stretch";
import Style from "./font-style";
import Weight from "./font-weight";

const { map, option, pair, right, delimited } = Parser;

// font may only set font-variant-caps to small-caps, but setting font
// does reset all font-variant-* longhand to initial value (this is good!)
/**
 * @internal
 */
export const parsePrelude: Parser<
  Slice<Token>,
  [
    ["font-stretch", Stretch.Specified | Keyword<"initial">],
    ["font-style", Longhand.Parsed<typeof Style> | Keyword<"initial">],
    // only "normal" and "small-caps" are accepted in font…
    [
      "font-variant-caps",
      Keyword<"normal"> | Keyword<"small-caps"> | Keyword<"initial">
    ],
    ["font-weight", Longhand.Parsed<typeof Weight> | Keyword<"initial">]
  ],
  string
> = (input) => {
  let style: Longhand.Parsed<typeof Style> | undefined;
  let variant: Keyword<"normal"> | Keyword<"small-caps"> | undefined;
  let weight: Longhand.Parsed<typeof Weight> | undefined;
  let stretch: Stretch.Specified | undefined;

  while (true) {
    for (const [remainder] of Token.parseWhitespace(input)) {
      input = remainder;
    }

    if (style === undefined) {
      const result = Style.parseBase(input);

      if (result.isOk()) {
        [input, style] = result.get();
        continue;
      }
    }

    if (variant === undefined) {
      const result = Keyword.parse("normal", "small-caps")(input);

      if (result.isOk()) {
        [input, variant] = result.get();
        continue;
      }
    }

    if (weight === undefined) {
      const result = Weight.parseBase(input);

      if (result.isOk()) {
        [input, weight] = result.get();
        continue;
      }
    }

    if (stretch === undefined) {
      const result = Stretch.parseAbsolute(input);

      if (result.isOk()) {
        [input, stretch] = result.get();
        continue;
      }
    }

    break;
  }

  return Result.of([
    input,
    [
      ["font-stretch", stretch ?? Keyword.of("initial")],
      ["font-style", style ?? Keyword.of("initial")],
      ["font-variant-caps", variant ?? Keyword.of("initial")],
      ["font-weight", weight ?? Keyword.of("initial")],
    ],
  ]);
};

/**
 * @internal
 */
export const parse = pair(
  parsePrelude,
  pair(
    delimited(option(Token.parseWhitespace), Size.parseBase),
    pair(
      option(
        right(
          delimited(option(Token.parseWhitespace), Token.parseDelim("/")),
          LineHeight.parseBase
        )
      ),
      delimited(option(Token.parseWhitespace), Family.parseBase)
    )
  )
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/font}
 * @internal
 */
export default Shorthand.of(
  [
    "font-family",
    "font-size",
    "font-stretch",
    "font-style",
    "font-variant-caps",
    "font-variant-east-asian",
    "font-variant-ligatures",
    "font-variant-numeric",
    "font-variant-position",
    "font-weight",
    "line-height",
  ],
  map(parse, ([prelude, [size, [lineHeight, family]]]) => [
    ...prelude,
    ["font-size", size],
    ["line-height", lineHeight.getOr(Keyword.of("initial"))],
    ["font-family", family],
  ])
);
