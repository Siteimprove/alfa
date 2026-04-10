import { Keyword, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";
import type { Longhand } from "../longhand.ts";

import { Shorthand } from "../shorthand.ts";

import * as Color from "./border-top-color.ts";
import Style from "./border-top-style.ts";
import * as Width from "./border-top-width.ts";

const { doubleBar, map } = Parser;

export const parse = map(
  doubleBar<
    Slice<Token>,
    [Color.Specified, Longhand.Parsed<typeof Style>, Width.Specified],
    string
  >(Token.parseWhitespace, Color.parse, Style.parseBase, Width.parse),
  ([color, style, width]) =>
    [
      color ?? Keyword.of("initial"),
      style ?? Keyword.of("initial"),
      width ?? Keyword.of("initial"),
    ] as const,
);

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
  ]),
);
