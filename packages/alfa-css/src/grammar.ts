import { Production, Command } from "@siteimprove/alfa-lang";
import { Token, Whitespace } from "./alphabet";

/**
 * @internal
 */
export const whitespace: Production<Token, never, Whitespace> = {
  token: "whitespace",
  prefix() {
    return Command.Continue;
  },
  infix() {
    return Command.Continue;
  }
};
