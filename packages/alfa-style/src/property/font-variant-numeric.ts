import { Keyword, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Property } from "../property";
import { List } from "./value/list";

const { either } = Parser;

declare module "../property" {
  interface Longhands {
    "font-variant-numeric": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified = Keyword<"normal"> | List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Figure = Keyword<"lining-nums"> | Keyword<"oldstyle-nums">;

  export type Spacing = Keyword<"proportional-nums"> | Keyword<"tabular-nums">;

  export type Fraction =
    | Keyword<"diagonal-fractions">
    | Keyword<"stacked-fractions">;

  export type Item =
    | Figure
    | Spacing
    | Fraction
    | Keyword<"ordinal">
    | Keyword<"slashed-zero">;
}
/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parseFigure = Keyword.parse("lining-nums", "oldstyle-nums");

/**
 * @internal
 */
export const parseSpacing = Keyword.parse("proportional-nums", "tabular-nums");

/**
 * @internal
 */
export const parseFraction = Keyword.parse(
  "diagonal-fractions",
  "stacked-fractions"
);

/**
 * @internal
 */
const parseNumeric: Parser<Slice<Token>, List<Specified.Item>, string> = (
  input
) => {
  let figure: Specified.Figure | undefined;
  let spacing: Specified.Spacing | undefined;
  let fraction: Specified.Fraction | undefined;
  let ordinal: Keyword<"ordinal"> | undefined;
  let slashed: Keyword<"slashed-zero"> | undefined;

  while (true) {
    for (const [remainder] of Token.parseWhitespace(input)) {
      input = remainder;
    }

    if (figure === undefined) {
      const result = parseFigure(input);

      if (result.isOk()) {
        [input, figure] = result.get();
        continue;
      }
    }

    if (spacing === undefined) {
      const result = parseSpacing(input);

      if (result.isOk()) {
        [input, spacing] = result.get();
        continue;
      }
    }

    if (fraction === undefined) {
      const result = parseFraction(input);

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
    figure === undefined &&
    spacing === undefined &&
    fraction === undefined &&
    ordinal === undefined &&
    slashed === undefined
  ) {
    return Err.of("At least one numeric value must be provided");
  }

  return Result.of([
    input,
    List.of(
      [figure, spacing, fraction, ordinal, slashed].filter(
        (value) => value !== undefined
        // filter doesn't narrow so we need to do it manually
      ) as Array<Specified.Item>,
      " "
    ),
  ]);
};

/**
 * @internal
 */
export const parse = either(Keyword.parse("normal"), parseNumeric);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric}
 * @internal
 */
export default Property.register(
  "font-variant-numeric",
  Property.of<Specified, Computed>(
    Keyword.of("normal"),
    parse,
    (numeric) => numeric,
    { inherits: true }
  )
);
