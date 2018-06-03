import { Token, Pattern, Command } from "./types";
import { Alphabet } from "./alphabet";
import { Stream } from "./stream";

export function lex<T extends Token, S = null>(
  input: string,
  alphabet: Alphabet<T, S>
): Array<T> {
  const tokens: Array<T> = [];

  const emit: (token: T) => void = token => tokens.push(token);

  const characters: Array<number> = new Array(input.length);

  for (let i = 0, n = input.length; i < n; i++) {
    characters[i] = input.charCodeAt(i);
  }

  const stream = new Stream(characters);

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
