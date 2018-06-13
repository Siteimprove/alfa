import { Production, Command } from "@siteimprove/alfa-lang";
import { Token, TokenType, Whitespace } from "./alphabet";

/**
 * @internal
 */
export const whitespace: Production<Token, never, Whitespace> = {
  token: TokenType.Whitespace,
  prefix() {
    return Command.Continue;
  },
  infix() {
    return Command.Continue;
  }
};
