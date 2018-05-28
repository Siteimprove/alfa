import { Token, Pattern, Command } from "./types";
import { Alphabet } from "./alphabet";
import { Stream } from "./stream";

export function lex<T extends Token, S = null>(
  input: string,
  alphabet: Alphabet<T, S>
): Array<T> {
  const tokens: Array<T> = [];
  const stream = new Stream(input);

  function emit<U extends T>(token: U): void {
    tokens.push(token);
  }

  const state = alphabet.state(stream);

  let pattern: Pattern<T, S> = alphabet.pattern;

  while (true) {
    const next = pattern(stream, emit, state);

    if (next === undefined) {
      continue;
    }

    if (typeof next === "function") {
      pattern = next;
    } else {
      if (next === Command.End) {
        break;
      }
    }
  }

  return tokens;
}
