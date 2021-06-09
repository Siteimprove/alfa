import { Keyword, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Property } from "../property";
import { List } from "./value/list";

const { either } = Parser;

declare module "../property" {
  interface Longhands {
    "font-variant-east-asian": Property<Specified, Computed>;
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
  export type Variant =
    | Keyword<"jis78">
    | Keyword<"jis83">
    | Keyword<"jis90">
    | Keyword<"jis04">
    | Keyword<"simplified">
    | Keyword<"traditional">;

  export type Width = Keyword<"proportional-width"> | Keyword<"full-width">;

  export type Item = Variant | Width | Keyword<"ruby">;
}
/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parseVariant = Keyword.parse(
  "jis78",
  "jis83",
  "jis90",
  "jis04",
  "simplified",
  "traditional"
);

/**
 * @internal
 */
export const parseWidth = Keyword.parse("proportional-width", "full-width");

/**
 * @internal
 */
const parseEastAsian: Parser<Slice<Token>, List<Specified.Item>, string> = (
  input
) => {
  let variant: Specified.Variant | undefined;
  let width: Specified.Width | undefined;
  let ruby: Keyword<"ruby"> | undefined;

  while (true) {
    for (const [remainder] of Token.parseWhitespace(input)) {
      input = remainder;
    }

    if (variant === undefined) {
      const result = parseVariant(input);

      if (result.isOk()) {
        [input, variant] = result.get();
        continue;
      }
    }

    if (width === undefined) {
      const result = parseWidth(input);

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

    break;
  }

  if (variant === undefined && width === undefined && ruby === undefined) {
    return Err.of("At least one East Asian variant value must be provided");
  }

  return Result.of([
    input,
    List.of(
      [variant, width, ruby].filter(
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
export const parse = either(Keyword.parse("normal"), parseEastAsian);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-east-asian}
 * @internal
 */
export default Property.register(
  "font-variant-east-asian",
  Property.of<Specified, Computed>(
    Keyword.of("normal"),
    parse,
    (numeric) => numeric,
    { inherits: true }
  )
);
