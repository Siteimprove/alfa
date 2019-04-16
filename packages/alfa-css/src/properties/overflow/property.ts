import { parse } from "@siteimprove/alfa-lang";
import { Shorthand } from "../../properties";
import { OverflowGrammar } from "./grammar";

/**
 * @see https://drafts.csswg.org/css-overflow-3/#propdef-overflow
 */
export const overflow: Shorthand<"overflowX" | "overflowY"> = {
  longhands: ["overflowX", "overflowY"],
  parse(input) {
    const parser = parse(input, OverflowGrammar);

    if (!parser.done) {
      return null;
    }

    return parser.result;
  }
};
