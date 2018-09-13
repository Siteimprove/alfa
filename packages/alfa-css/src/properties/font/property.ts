import { parse } from "@siteimprove/alfa-lang";
import { Shorthand } from "../../types";
import { FontFamily, FontSize, FontWeight } from "./types";

import { FontFamilyGrammar } from "./family/grammar";
import { FontSizeGrammar } from "./size/grammar";
import { FontWeightGrammar } from "./weight/grammar";

export const font: Shorthand<"fontFamily" | "fontSize" | "fontWeight"> = {
  parse(tokens) {
    let fontWeight: FontWeight | null = null;

    while (true) {
      if (fontWeight === null) {
        const parser = parse(tokens, FontWeightGrammar);

        if (parser.result !== null) {
          fontWeight = parser.result;
          tokens = tokens.slice(parser.position);
          continue;
        }
      }

      break;
    }

    let fontSize: FontSize;

    {
      const parser = parse(tokens, FontSizeGrammar);

      if (parser.result === null) {
        return null;
      }

      fontSize = parser.result;
      tokens = tokens.slice(parser.position);
    }

    let fontFamily: FontFamily;

    {
      const parser = parse(tokens, FontFamilyGrammar);

      if (parser.result === null) {
        return null;
      }

      fontFamily = parser.result;
      tokens = tokens.slice(parser.position);
    }

    return {
      fontSize,
      fontFamily,

      // Optional properties go at the end of the result object in order to make
      // the most of hidden classes.
      ...(fontWeight === null ? {} : { fontWeight })
    };
  }
};
