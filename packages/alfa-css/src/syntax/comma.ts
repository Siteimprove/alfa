import { Parser } from "@siteimprove/alfa-parser";
import { Token } from "./token";

const { option, delimited } = Parser;

/**
 * @public
 */
export namespace Comma {
  /**
   * @remarks
   * In CSS, commas can often be preceded or followed by whitespace.
   */
  export const parse = delimited(
    option(Token.parseWhitespace),
    Token.parseComma
  );
}
