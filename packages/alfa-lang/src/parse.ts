import { clamp } from "@siteimprove/alfa-util";
import { Grammar } from "./grammar";
import { Stream } from "./stream";
import { Command, Token } from "./types";

export interface ParseResult<R> {
  readonly result: R | null;
  readonly done: boolean;
  readonly position: number;
}

export function parse<T extends Token, R, S = null>(
  input: ArrayLike<T>,
  grammar: Grammar<T, R, S>,
  offset = 0
): ParseResult<R> {
  offset = clamp(offset, 0, input.length - 1);

  const readToken: (i: number) => T = i => input[i + offset];

  const stream = new Stream(input.length - offset, readToken);

  const state = grammar.state();

  function expression(power: number): ParseResult<R> {
    let token = stream.peek(0);

    if (token === null) {
      return {
        result: null,
        done: stream.done(),
        position: stream.position()
      };
    }

    const entry = grammar.get(token.type);

    if (entry === null) {
      return {
        result: null,
        done: stream.done(),
        position: stream.position()
      };
    }

    const { production } = entry;

    if (production.prefix === undefined) {
      return {
        result: null,
        done: stream.done(),
        position: stream.position()
      };
    }

    stream.advance(1);

    let left = production.prefix(
      token,
      stream,
      () => expression(-1).result,
      state
    );

    if (left === null) {
      return {
        result: null,
        done: stream.done(),
        position: stream.position()
      };
    }

    if (left === Command.Continue) {
      return expression(power);
    }

    token = stream.peek(0);

    while (token !== null) {
      const entry = grammar.get(token.type);

      if (entry === null) {
        break;
      }

      const { production, precedence } = entry;

      if (precedence < power || production.infix === undefined) {
        break;
      }

      if (precedence === power && production.associate !== "right") {
        break;
      }

      stream.advance(1);

      const right = production.infix(
        token,
        stream,
        () => expression(precedence).result,
        left,
        state
      );

      if (right === null) {
        stream.backup(1);

        return {
          result: left,
          done: stream.done(),
          position: stream.position()
        };
      }

      token = stream.peek(0);

      if (right === Command.Continue) {
        continue;
      }

      left = right;
    }

    return {
      result: left,
      done: stream.done(),
      position: stream.position()
    };
  }

  return expression(-1);
}
