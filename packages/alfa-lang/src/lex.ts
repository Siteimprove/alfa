import { Alphabet } from "./alphabet";
import { Stream } from "./stream";
import { Exit, Pattern, Token } from "./types";

const commands: Readonly<{ exit: Exit }> = { exit: Exit };

export interface LexResult<T extends Token> {
  readonly result: Array<T>;
  readonly done: boolean;
  readonly position: number;
}

export function lex<T extends Token, S = null>(
  input: string,
  alphabet: Alphabet<T, S>,
  offset?: number
): LexResult<T> {
  const tokens: Array<T> = [];

  const emit: (token: T) => void = token => tokens.push(token);

  const readCharacter: (i: number) => number = i => input.charCodeAt(i);

  const stream = new Stream(input.length, readCharacter, offset);

  const state = alphabet.state();

  let pattern: Pattern<T, S> = alphabet.pattern;

  while (true) {
    const next = pattern(stream, emit, state, commands);

    if (next === undefined) {
      continue;
    }

    if (next === Exit) {
      break;
    }

    pattern = next;
  }

  return {
    result: tokens,
    done: stream.done(),
    position: stream.position()
  };
}
