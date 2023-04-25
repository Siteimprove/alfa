import { Keyword, Token } from "@siteimprove/alfa-css";
import { Err, Result } from "@siteimprove/alfa-result";

import { Shorthand } from "../foo-shorthand-class";

import * as Color from "./outline-color";
import * as Style from "./outline-style";
import * as Width from "./outline-width";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/outline}
 * @internal
 */
export default Shorthand.of(
  ["outline-width", "outline-style", "outline-color"],
  (input) => {
    let width: Width.Specified | undefined;
    let style: Style.Specified | undefined;
    let color: Color.Specified | undefined;

    while (true) {
      for (const [remainder] of Token.parseWhitespace(input)) {
        input = remainder;
      }

      if (width === undefined) {
        const result = Width.parse(input);

        if (result.isOk()) {
          [input, width] = result.get();
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
