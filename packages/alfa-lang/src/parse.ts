import { Grammar } from "./grammar";
import { Stream } from "./stream";
import { Command, Token } from "./types";

export function parse<T extends Token, R, S = null>(
  input: ArrayLike<T>,
  grammar: Grammar<T, R, S>
): R | null {
  const readToken: (i: number) => T = i => input[i];

  const stream = new Stream(input.length, readToken);

  const state = grammar.state();

  function expression(power: number): R | null {
    let token = stream.peek(0);

    if (token === null) {
      return null;
    }

    const entry = grammar.get(token.type);

    if (entry === null) {
      return null;
    }

    const { production } = entry;

    if (production.prefix === undefined) {
      return null;
    }

    stream.advance(1);

    let left = production.prefix(token, stream, () => expression(-1), state);

    if (left === null) {
      return null;
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
        () => expression(precedence),
        left,
        state
      );

      if (right === null) {
        return null;
      }

      token = stream.peek(0);

      if (right === Command.Continue) {
        continue;
      }

      left = right;
    }

    return left;
  }

  const result = expression(-1);

  if (stream.advance(1) !== false) {
    return null;
  }

  return result;
}
