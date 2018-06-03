import { Token, Pattern, Command } from "./types";
import { Alphabet } from "./alphabet";
import { Stream } from "./stream";

export function lex<T extends Token, S = null>(
  input: string,
  alphabet: Alphabet<T, S>
): Array<T> {
  const tokens: Array<T> = [];

  const emit: (token: T) => void = token => tokens.push(token);

  const stream = new Stream(input.length, i => input.charCodeAt(i));

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
