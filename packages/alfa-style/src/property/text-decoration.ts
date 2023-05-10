import { Keyword, Token } from "@siteimprove/alfa-css";
import { Err, Result } from "@siteimprove/alfa-result";

import { Shorthand } from "../shorthand";

import * as Color from "./text-decoration-color";
import * as Line from "./text-decoration-line";
import * as Style from "./text-decoration-style";
import * as Thickness from "./text-decoration-thickness";

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
    let line: Line.Specified | undefined;
    let style: Style.Specified | undefined;
    let color: Color.Specified | undefined;
    let thickness: Thickness.Specified | undefined;

    while (true) {
      for (const [remainder] of Token.parseWhitespace(input)) {
        input = remainder;
      }

      if (line === undefined) {
        const result = Line.parse(input);

        if (result.isOk()) {
          [input, line] = result.get();
          continue;
        }
      }

      if (style === undefined) {
        const result = Style.parse(input);

        if (result.isOk()) {
          [input, style] = result.get();
          continue;
        }
      }

      if (color === undefined) {
        const result = Color.parse(input);

        if (result.isOk()) {
          [input, color] = result.get();
          continue;
        }
      }

      if (thickness === undefined) {
        const result = Thickness.parse(input);

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
