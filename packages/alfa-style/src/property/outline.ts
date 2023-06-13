import { Keyword, Token } from "@siteimprove/alfa-css";
import { Err, Result } from "@siteimprove/alfa-result";

import { Longhand } from "../longhand";
import { Shorthand } from "../shorthand";

import Color from "./outline-color";
import Style from "./outline-style";
import Width from "./outline-width";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/outline}
 * @internal
 */
export default Shorthand.of(
  ["outline-width", "outline-style", "outline-color"],
  (input) => {
    let width: Longhand.Parsed<typeof Width> | undefined;
    let style: Longhand.Parsed<typeof Style> | undefined;
    let color: Longhand.Parsed<typeof Color> | undefined;

    while (true) {
      for (const [remainder] of Token.parseWhitespace(input)) {
        input = remainder;
      }

      if (width === undefined) {
        const result = Width.parseBase(input);

        if (result.isOk()) {
          [input, width] = result.get();
          continue;
        }
      }

      if (style === undefined) {
        const result = Style.parseBase(input);

        if (result.isOk()) {
          [input, style] = result.get();
          continue;
        }
      }

      if (color === undefined) {
        const result = Color.parseBase(input);

        if (result.isOk()) {
          [input, color] = result.get();
          continue;
        }
      }

      break;
    }

    if (width === undefined && style === undefined && color === undefined) {
      return Err.of(`Expected one of width, style, or color`);
    }

    return Result.of([
      input,
      [
        ["outline-width", width ?? Keyword.of("initial")],
        ["outline-style", style ?? Keyword.of("initial")],
        ["outline-color", color ?? Keyword.of("initial")],
      ],
    ]);
  }
);
