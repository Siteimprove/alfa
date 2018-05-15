import { Token } from "./types";
import { Grammar } from "./grammar";
import { TokenStream } from "./stream";

export function parse<T extends Token, R>(
  input: Array<T>,
  grammar: Grammar<T, R>
): R | null {
  const stream = new TokenStream(input);

  function expression(power: number): R | null {
    const token = stream.peek();

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
      return expression(power);
    }

    while (stream.peek()) {
      const token = stream.peek();

      if (token === null) {
        break;
      }

      const entry = grammar.get(token);

      if (entry === null) {
        break;
      }

      const { production, precedence } = entry;

      if (production.infix === undefined) {
        break;
      }

      if (
        precedence < power ||
        (precedence === power && production.associate !== "right")
      ) {
        break;
      }

      stream.advance();

      const right = production.infix(
        token,
        stream,
        () => expression(precedence),
        left
      );

      if (right !== null) {
        left = right;
      }
    }

    return left;
  }

  const result = expression(-1);
  const end = stream.peek();

  if (end !== null) {
    throw new Error(`Unexpected token "${end.type}"`);
  }

  return result;
}
