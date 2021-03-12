import { Keyword, Token } from "@siteimprove/alfa-css";
import { Err, Result } from "@siteimprove/alfa-result";

import { Property } from "../property";

import * as Color from "./text-decoration-color";
import * as Line from "./text-decoration-line";
import * as Style from "./text-decoration-style";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration}
 * @internal
 */
export default Property.shorthand(
  ["text-decoration-line", "text-decoration-style", "text-decoration-color"],
  (input) => {
    let line: Line.Specified | undefined;
    let style: Style.Specified | undefined;
    let color: Color.Specified | undefined;

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

      break;
    }

    if (line === undefined && style === undefined && color === undefined) {
      return Err.of(`Expected one of line, style, or color`);
    }

    return Result.of([
      input,
      [
        ["text-decoration-line", line ?? Keyword.of("initial")],
        ["text-decoration-style", style ?? Keyword.of("initial")],
        ["text-decoration-color", color ?? Keyword.of("initial")],
      ],
    ]);
  }
);
