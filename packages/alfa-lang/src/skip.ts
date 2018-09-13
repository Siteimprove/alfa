import { Command, Production, Token } from "./types";

export function skip<T extends Token>(token: number): Production<T, never> {
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
