import { clamp } from "@siteimprove/alfa-util";
import { Alphabet } from "./alphabet";
import { Stream } from "./stream";
import { Command, Pattern, Token } from "./types";

export interface LexResult<T extends Token> {
  readonly result: Array<T>;
  readonly done: boolean;
  readonly position: number;
}

export function lex<T extends Token, S = null>(
  input: string,
  alphabet: Alphabet<T, S>,
  offset = 0
): LexResult<T> {
  offset = clamp(offset, 0, input.length - 1);

  const tokens: Array<T> = [];

  const emit: (token: T) => void = token => tokens.push(token);

  const readCharacter: (i: number) => number = i =>
    input.charCodeAt(i + offset);

  const stream = new Stream(input.length - offset, readCharacter);

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

  return {
    result: tokens,
    done: stream.done(),
    position: stream.position()
  };
}
