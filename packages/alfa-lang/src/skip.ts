import { Command, Production, Token } from "./types";

export function skip<T extends Token, R>(token: number): Production<T, R> {
  return {
    token,
    prefix() {
      return Command.Continue;
    },
    infix() {
      return Command.Continue;
    }
  };
}
