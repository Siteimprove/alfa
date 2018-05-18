import { Token } from "./types";
import { Alphabet } from "./alphabet";
import { CharacterStream } from "./stream";

export function lex<T extends Token, S = null>(
  input: string,
  alphabet: Alphabet<T, S>
): Array<T> {
  const tokens: Array<T> = [];
  const stream = new CharacterStream(input);

  let done = false;

  function emit<U extends T>(token: U): void {
    tokens.push(token);
  }

  function end() {
    done = true;
  }

  const state = alphabet.state(stream);

  let { pattern } = alphabet;

  while (!done) {
    pattern = pattern(stream, emit, state, end) || pattern;
  }

  return tokens;
}
