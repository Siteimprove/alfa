import { Char, parse, Stream } from "@siteimprove/alfa-lang";
import { TokenType } from "../../alphabet";
import { Shorthand } from "../../properties";
import * as Longhands from "../../properties/longhands";
import { LineHeight } from "../line-height/types";
import { FontFamily, FontSize, FontWeight } from "./types";

import { LineHeightGrammar } from "../line-height/grammar";
import { FontFamilyGrammar } from "./family/grammar";
import { FontSizeGrammar } from "./size/grammar";
import { FontWeightGrammar } from "./weight/grammar";

/**
 * @see https://www.w3.org/TR/css-fonts/#propdef-font
 */
export const font: Shorthand<"fontFamily" | "fontSize" | "fontWeight"> = {
  longhands: ["fontFamily", "fontSize", "fontWeight"],
  parse(tokens) {
    let offset = 0;
    let fontWeight: FontWeight | null = null;

    while (true) {
      if (fontWeight === null) {
        const { result, position } = parse(tokens, FontWeightGrammar, offset);

        if (result !== null) {
          fontWeight = result;
          offset = position;
          continue;
        }
      }

      break;
    }

    if (fontWeight === null) {
      fontWeight = Longhands.fontWeight.initial();
    }

    let fontSize: FontSize;

    {
      const { result, position } = parse(tokens, FontSizeGrammar, offset);

      if (result === null) {
        return null;
      }

      fontSize = result;
      offset = position;
    }

    let lineHeight: LineHeight = Longhands.lineHeight.initial();

    {
      const stream = new Stream(tokens.length, i => tokens[i], offset);

      stream.accept(token => token.type === TokenType.Whitespace);

      const next = stream.peek(0);

      if (
        next !== null &&
        next.type === TokenType.Delim &&
        next.value === Char.Solidus
      ) {
        stream.advance(1);

        const { result, position } = parse(
          tokens,
          LineHeightGrammar,
          stream.position()
        );

        if (result === null) {
          return null;
        }

        lineHeight = result;
        offset = position;
      }
    }

    let fontFamily: FontFamily;

    {
      const { result, position } = parse(tokens, FontFamilyGrammar, offset);

      if (result === null) {
        return null;
      }

      fontFamily = result;
      offset = position;
    }

    return {
      fontWeight,
      fontSize,
      lineHeight,
      fontFamily
    };
  }
};
