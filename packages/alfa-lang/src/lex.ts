import { Alphabet } from "./alphabet";
import { Stream } from "./stream";
import { Command, Pattern, Token } from "./types";

export function lex<T extends Token, S = null>(
  input: string,
  alphabet: Alphabet<T, S>
): Array<T> {
  const tokens: Array<T> = [];

  const emit: (token: T) => void = token => tokens.push(token);

  const readCharacter: (i: number) => number = i => input.charCodeAt(i);

  const stream = new Stream(input.length, readCharacter);

  const state = alphabet.state();

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
