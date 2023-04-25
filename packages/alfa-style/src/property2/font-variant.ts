import { Token, Keyword } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import * as Caps from "./font-variant-caps";
import * as EastAsian from "./font-variant-east-asian";
import * as Ligatures from "./font-variant-ligatures";
import * as Numeric from "./font-variant-numeric";

import { List } from "./value/list";

/**
 * @internal
 */
export const parse: Parser<
  Slice<Token>,
  [
    ["font-variant-caps", Caps.Specified | Keyword<"initial">],
    ["font-variant-east-asian", EastAsian.Specified | Keyword<"initial">],
    ["font-variant-ligatures", Ligatures.Specified | Keyword<"initial">],
    ["font-variant-numeric", Numeric.Specified | Keyword<"initial">]
  ],
  string
> = (input) => {
  /* Unfortunately, the various components of each longhand can be mixed, so
   * we need to rewrite a parser and accept, e.g.
   * font-variant: historical-ligatures diagonal-fractions no-common-ligatures ordinal
   */
  let caps: Caps.Specified | undefined;

  let variant: EastAsian.Specified.Variant | undefined;
  let width: EastAsian.Specified.Width | undefined;
  let ruby: Keyword<"ruby"> | undefined;

  let common: Ligatures.Specified.Common | undefined;
  let discretionary: Ligatures.Specified.Discretionary | undefined;
  let historical: Ligatures.Specified.Historical | undefined;
  let contextual: Ligatures.Specified.Contextual | undefined;

  let figure: Numeric.Specified.Figure | undefined;
  let spacing: Numeric.Specified.Spacing | undefined;
  let fraction: Numeric.Specified.Fraction | undefined;
  let ordinal: Keyword<"ordinal"> | undefined;
  let slashed: Keyword<"slashed-zero"> | undefined;

  while (true) {
    for (const [remainder] of Token.parseWhitespace(input)) {
      input = remainder;
    }

    // -------------------------    Caps
    if (caps === undefined) {
      const result = Caps.parse(input);

      if (result.isOk()) {
        [input, caps] = result.get();
        continue;
      }
    }

    // -------------------------    East Asian
    if (variant === undefined) {
      const result = EastAsian.parseVariant(input);

      if (result.isOk()) {
        [input, variant] = result.get();
        continue;
      }
    }

    if (width === undefined) {
      const result = EastAsian.parseWidth(input);

      if (result.isOk()) {
        [input, width] = result.get();
        continue;
      }
    }

    if (ruby === undefined) {
      const result = Keyword.parse("ruby")(input);

      if (result.isOk()) {
        [input, ruby] = result.get();
        continue;
      }
    }

    // -------------------------    Ligatures
    if (common === undefined) {
      const result = Ligatures.parseCommon(input);

      if (result.isOk()) {
        [input, common] = result.get();
        continue;
      }
    }

    if (discretionary === undefined) {
      const result = Ligatures.parseDiscretionary(input);

      if (result.isOk()) {
        [input, discretionary] = result.get();
        continue;
      }
    }

    if (historical === undefined) {
      const result = Ligatures.parseHistorical(input);

      if (result.isOk()) {
        [input, historical] = result.get();
        continue;
      }
    }

    if (contextual === undefined) {
      const result = Ligatures.parseContextual(input);

      if (result.isOk()) {
        [input, contextual] = result.get();
        continue;
      }
    }

    // -------------------------    Numeric
    if (figure === undefined) {
      const result = Numeric.parseFigure(input);

      if (result.isOk()) {
        [input, figure] = result.get();
        continue;
      }
    }

    if (spacing === undefined) {
      const result = Numeric.parseSpacing(input);

      if (result.isOk()) {
        [input, spacing] = result.get();
        continue;
      }
    }

    if (fraction === undefined) {
      const result = Numeric.parseFraction(input);

      if (result.isOk()) {
        [input, fraction] = result.get();
        continue;
      }
    }

    if (ordinal === undefined) {
      const result = Keyword.parse("ordinal")(input);

      if (result.isOk()) {
        [input, ordinal] = result.get();
        continue;
      }
    }

    if (slashed === undefined) {
      const result = Keyword.parse("slashed-zero")(input);

      if (result.isOk()) {
        [input, slashed] = result.get();
        continue;
      }
    }

    break;
  }

  if (
    caps === undefined &&
    variant === undefined &&
    width === undefined &&
    ruby === undefined &&
    common === undefined &&
    discretionary === undefined &&
    historical === undefined &&
    contextual === undefined &&
    figure === undefined &&
    spacing === undefined &&
    fraction === undefined &&
    ordinal === undefined &&
    slashed === undefined
  ) {
    return Err.of("At least one Font variant value must be provided");
  }

  function list<T>(
    ...values: Array<T | undefined>
  ): List<T> | Keyword<"initial"> {
    // filter doesn't narrow so we need to do it manually
    const cleaned = values.filter((value) => value !== undefined) as Array<T>;

    return cleaned.length > 0 ? List.of(cleaned, " ") : Keyword.of("initial");
  }

  return Result.of([
    input,
    [
      ["font-variant-caps", caps ?? Keyword.of("initial")],
      [
        "font-variant-east-asian",
        list<EastAsian.Specified.Item>(variant, width, ruby),
      ],
      [
        "font-variant-ligatures",
        list<Ligatures.Specified.Item>(
          common,
          discretionary,
          historical,
          contextual
        ),
      ],
      [
        "font-variant-numeric",
        list<Numeric.Specified.Item>(
          figure,
          spacing,
          fraction,
          ordinal,
          slashed
        ),
      ],
    ],
  ]);
};

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant}
 * @internal
 */
export default Property.shorthand(
  [
    "font-variant-caps",
    "font-variant-east-asian",
    "font-variant-ligatures",
    "font-variant-numeric",
  ],
  parse
);
