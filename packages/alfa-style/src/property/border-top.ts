import { Keyword, Length, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Property } from "../property";

import { Specified as Color, parse as parseColor } from "./border-top-color";
import { Specified as Style, parse as parseStyle } from "./border-top-style";
import { Specified as Width, parse as parseWidth } from "./border-top-width";

const { map } = Parser;

declare module "../property" {
  interface Shorthands {
    "border-top": Property.Shorthand<
      "border-top-color" | "border-top-style" | "border-top-width"
    >;
  }
}

export const parse: Parser<Slice<Token>, [Color, Style, Width], string> = (
  input
) => {
  let color: Color | undefined;
  let style: Style | undefined;
  let width: Width | undefined;

  while (true) {
    for (const [remainder] of Token.parseWhitespace(input)) {
      input = remainder;
    }

    // <color>
    if (color === undefined) {
      const result = parseColor(input);

      if (result.isOk()) {
        [input, color] = result.get();
        continue;
      }
    }

    // <style>
    if (style === undefined) {
      const result = parseStyle(input);

      if (result.isOk()) {
        [input, style] = result.get();
        continue;
      }
    }

    // <width>
    if (width === undefined) {
      const result = parseWidth(input);

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
      color ?? Keyword.of("currentcolor"),
      style ?? Keyword.of("none"),
      width ?? Length.of(3, "px"),
    ],
  ]);
};

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-top}
 * @internal
 */
export default Property.registerShorthand(
  "border-top",
  Property.shorthand(
    ["border-top-color", "border-top-style", "border-top-width"],
    map(parse, ([color, style, width]) => [
      ["border-top-color", color],
      ["border-top-style", style],
      ["border-top-width", width],
    ])
  )
);
