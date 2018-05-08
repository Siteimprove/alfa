import { Token, WithLocation } from "./types";
import { Alphabet } from "./alphabet";
import { CharacterStream } from "./stream";

export function lex<T extends Token>(
  input: string,
  alphabet: Alphabet<T>
): Array<WithLocation<T>> {
  const tokens: Array<WithLocation<T>> = [];
  const stream = new CharacterStream(input);

  let done = false;

  function emit<U extends T>(token: WithLocation<U>): void {
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
