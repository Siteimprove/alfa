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
    let overflowX: Overflow;
    let overflowY: Overflow;
    {
      const { result, position } = parse(tokens, OverflowGrammar, offset);

      if (result !== null) {
        overflowX = result;
        offset = position;
      }
    }

    {
      const { result, position } = parse(tokens, OverflowGrammar, offset);

      if (result === null) {
        overflowY = overflowX;
      }

      overflowY = result;
      offset = position;
    }

    return {
      overflowX,
      overflowY
    };
  }
};
