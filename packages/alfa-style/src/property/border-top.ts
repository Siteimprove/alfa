import { Keyword, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Shorthand } from "../shorthand";

import * as Color from "./border-top-color";
import Style from "./border-top-style";
import * as Width from "./border-top-width";
import { Longhand } from "../longhand";

const { map } = Parser;

export const parse: Parser<
  Slice<Token>,
  [
    Color.Specified | Keyword<"initial">,
    Longhand.Parsed<typeof Style> | Keyword<"initial">,
    Width.Specified | Keyword<"initial">
  ],
  string
> = (input) => {
  let color: Color.Specified | undefined;
  let style: Longhand.Parsed<typeof Style> | undefined;
  let width: Width.Specified | undefined;

  while (true) {
    for (const [remainder] of Token.parseWhitespace(input)) {
      input = remainder;
    }

    // <color>
    if (color === undefined) {
      const result = Color.parse(input);

      if (result.isOk()) {
        [input, color] = result.get();
        continue;
      }
    }

    // <style>
    if (style === undefined) {
      const result = Style.parseBase(input);

      if (result.isOk()) {
        [input, style] = result.get();
        continue;
      }
    }

    // <width>
    if (width === undefined) {
      const result = Width.parse(input);

      if (result.isOk()) {
        [input, width] = result.get();
        continue;
      }
    }

    break;
  }

  return Result.of([
    input,
    [
      color ?? Keyword.of("initial"),
      style ?? Keyword.of("initial"),
      width ?? Keyword.of("initial"),
    ],
  ]);
};

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-top}
 * @internal
 */
export default Shorthand.of(
  ["border-top-color", "border-top-style", "border-top-width"],
  map(parse, ([color, style, width]) => [
    ["border-top-color", color],
    ["border-top-style", style],
    ["border-top-width", width],
  ])
);
