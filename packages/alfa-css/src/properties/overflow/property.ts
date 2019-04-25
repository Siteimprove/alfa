import { parse } from "@siteimprove/alfa-lang";
import { Shorthand } from "../../properties";
import { OverflowGrammar } from "./grammar";

/**
 * @see https://drafts.csswg.org/css-overflow-3/#propdef-overflow
 */
export const overflow: Shorthand<"overflowX" | "overflowY"> = {
  longhands: ["overflowX", "overflowY"],
  parse(tokens) {
    let offset = 0;
    let overflowX;
    let overflowY;
    {
      const { result, position, done } = parse(tokens, OverflowGrammar, offset);

      if (result !== null) {
        overflowX = result;
        offset = position;

        if (done) {
          return {
            overflowX,
            overflowY: overflowX
          };
        }
      } else {
        return null;
      }
    }

    {
      const { result, position } = parse(tokens, OverflowGrammar, offset);

      if (result !== null) {
        overflowY = result;
        offset = position;
      } else {
        return null;
      }
    }

    return {
      overflowX,
      overflowY
    };
  }
};
