import { Token, Command } from "./types";
import { Grammar } from "./grammar";
import { Stream } from "./stream";

export function parse<T extends Token, R>(
  input: ArrayLike<T>,
  grammar: Grammar<T, R>
): R | null {
  const stream = new Stream(input);

  function expression(power: number): R | null {
    let token = stream.peek();

    if (token === null) {
      return null;
    }

    const entry = grammar.get(token);

    if (entry === null) {
      return null;
    }

    const { production } = entry;

    if (production.prefix === undefined) {
      return null;
    }

    stream.advance();

    let left = production.prefix(token, stream, () => expression(-1));

    if (left === null) {
      return null;
    }

    if (left === Command.Continue) {
      return expression(power);
    }

    token = stream.peek();

    while (token !== null) {
      const entry = grammar.get(token);

      if (entry === null) {
        break;
      }

      const { production, precedence } = entry;

      if (production.infix === undefined) {
        break;
      }

      if (precedence < power) {
        break;
      }

      if (precedence === power && production.associate !== "right") {
        break;
      }

      stream.advance();

      const right = production.infix(
        token,
        stream,
        () => expression(precedence),
        left
      );

      if (right === null) {
        return null;
      }

      token = stream.peek();

      if (right === Command.Continue) {
        continue;
      }

      left = right;
    }

    return left;
  }

  const result = expression(-1);

  const token = stream.peek();

  if (token !== null) {
    throw new Error(`Unexpected token ${JSON.stringify(token)}`);
  }

  return result;
}
