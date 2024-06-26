import { Keyword, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Result } from "@siteimprove/alfa-result";
import type { Slice } from "@siteimprove/alfa-slice";

import { Shorthand } from "../shorthand.js";

import Direction from "./flex-direction.js";
import Wrap from "./flex-wrap.js";
import type { Longhand } from "../longhand.js";

const { map } = Parser;

const parse: Parser<
  Slice<Token>,
  [
    Longhand.Parsed<typeof Direction> | Keyword<"initial">,
    Longhand.Parsed<typeof Wrap> | Keyword<"initial">,
  ],
  string
> = (input) => {
  let direction: Longhand.Parsed<typeof Direction> | undefined;
  let wrap: Longhand.Parsed<typeof Wrap> | undefined;

  while (true) {
    for (const [remainder] of Token.parseWhitespace(input)) {
      input = remainder;
    }

    // <direction>
    if (direction === undefined) {
      const result = Direction.parseBase(input);

      if (result.isOk()) {
        [input, direction] = result.get();
        continue;
      }
    }

    // <wrap>
    if (wrap === undefined) {
      const result = Wrap.parseBase(input);

      if (result.isOk()) {
        [input, wrap] = result.get();
        continue;
      }
    }

    break;
  }

  return Result.of([
    input,
    [direction ?? Keyword.of("initial"), wrap ?? Keyword.of("initial")],
  ]);
};

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-flow}
 *
 * @internal
 */
export default Shorthand.of(
  ["flex-direction", "flex-wrap"],
  map(parse, ([direction, wrap]) => [
    ["flex-direction", direction],
    ["flex-wrap", wrap],
  ]),
);
