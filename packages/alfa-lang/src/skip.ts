import { Production, Token } from "./types";

export function skip<T extends Token, R>(token: number): Production<T, R> {
  return {
    token,
    prefix(token, stream, expression, state, { skip }) {
      return skip;
    },
    infix(token, stream, expression, left, state, { skip }) {
      return skip;
    }
  };
}
