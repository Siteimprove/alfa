import { Keyword, Token } from "@siteimprove/alfa-css";
import { Err, Result } from "@siteimprove/alfa-result";

import { Longhand } from "../longhand";
import { Shorthand } from "../shorthand";

import Color from "./text-decoration-color";
import Line from "./text-decoration-line";
import Style from "./text-decoration-style";
import Thickness from "./text-decoration-thickness";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration}
 * @internal
 */
export default Shorthand.of(
  [
    "text-decoration-line",
    "text-decoration-style",
    "text-decoration-color",
    "text-decoration-thickness",
  ],
  (input) => {
    let line: Longhand.Parsed<typeof Line> | undefined;
    let style: Longhand.Parsed<typeof Style> | undefined;
    let color: Longhand.Parsed<typeof Color> | undefined;
    let thickness: Longhand.Parsed<typeof Thickness> | undefined;

    while (true) {
      for (const [remainder] of Token.parseWhitespace(input)) {
        input = remainder;
      }

      if (line === undefined) {
        const result = Line.parseBase(input);

        if (result.isOk()) {
          [input, line] = result.get();
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

      if (thickness === undefined) {
        const result = Thickness.parseBase(input);

        if (result.isOk()) {
          [input, thickness] = result.get();
          continue;
        }
      }

      break;
    }

    if (
      line === undefined &&
      style === undefined &&
      color === undefined &&
      thickness === undefined
    ) {
      return Err.of(`Expected one of line, style, color, or thickness`);
    }

    return Result.of([
      input,
      [
        ["text-decoration-line", line ?? Keyword.of("initial")],
        ["text-decoration-style", style ?? Keyword.of("initial")],
        ["text-decoration-color", color ?? Keyword.of("initial")],
        ["text-decoration-thickness", thickness ?? Keyword.of("initial")],
      ],
    ]);
  }
);
