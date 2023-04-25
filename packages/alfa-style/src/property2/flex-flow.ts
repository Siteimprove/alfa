import { Keyword, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Shorthand } from "../foo-shorthand-class";

import * as Direction from "./flex-direction";
import * as Wrap from "./flex-wrap";

const { map } = Parser;

export const parse: Parser<
  Slice<Token>,
  [
    Direction.Specified | Keyword<"initial">,
    Wrap.Specified | Keyword<"initial">
  ],
  string
> = (input) => {
  let direction: Direction.Specified | undefined;
  let wrap: Wrap.Specified | undefined;

  while (true) {
    for (const [remainder] of Token.parseWhitespace(input)) {
      input = remainder;
    }

    // <direction>
    if (direction === undefined) {
      const result = Direction.parse(input);

      if (result.isOk()) {
        [input, direction] = result.get();
        continue;
      }
    }

    // <wrap>
    if (wrap === undefined) {
      const result = Wrap.parse(input);

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
 * @internal
 */
export default Shorthand.of(
    ["flex-direction", "flex-wrap"],
    map(parse, ([direction, wrap]) => [
      ["flex-direction", direction],
      ["flex-wrap", wrap],
    ])
);
