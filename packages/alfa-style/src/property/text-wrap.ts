import { Keyword, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";
import type { Longhand } from "../longhand.js";

import { Shorthand } from "../shorthand.js";

import Mode from "./text-wrap-mode.js";
import Style from "./text-wrap-style.js";

const { map, doubleBar } = Parser;

const parse = map(
  doubleBar<
    Slice<Token>,
    [Longhand.Parsed<typeof Mode>, Longhand.Parsed<typeof Style>],
    string
  >(Token.parseWhitespace, Mode.parseBase, Style.parseBase),
  ([mode, style]) =>
    [mode ?? Keyword.of("initial"), style ?? Keyword.of("initial")] as const,
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-flow}
 *
 * @internal
 */
export default Shorthand.of(
  ["text-wrap-mode", "text-wrap-style"],
  map(
    parse,
    ([mode, style]) =>
      [
        ["text-wrap-mode", mode],
        ["text-wrap-style", style],
      ] as const,
  ),
);
