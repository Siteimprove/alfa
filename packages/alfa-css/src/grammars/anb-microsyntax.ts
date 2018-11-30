import { Stream } from "@siteimprove/alfa-lang";
import { Token, TokenType } from "../alphabet";
import { AnBMicrosyntax } from "../types";

export function AnBMicrosyntax(stream: Stream<Token>): AnBMicrosyntax | null {
  let next = stream.next();

  if (next === null) {
    return null;
  }

  let a = 0;
  let b = 0;

  switch (next.type) {
    case TokenType.Ident:
      const oddEven = oddEvenSyntax(next.value);

      if (oddEven !== null) {
        return oddEven;
      }

      if (next.value !== "n") {
        return null;
      }

      next = stream.next();

      break;
    case TokenType.Dimension:
      if (next.unit !== "n") {
        return null;
      }

      a = next.value;

      next = stream.next();
  }

  if (next !== null && next.type === TokenType.Number) {
    b = next.value;
  } else {
    stream.backup(1);
  }

  return {
    a,
    b
  };
}

export function oddEvenSyntax(ident: string): AnBMicrosyntax | null {
  switch (ident) {
    case "odd":
      return {
        a: 2,
        b: 1
      };
    case "even":
      return {
        a: 2,
        b: 0
      };
    default:
      return null;
  }
}
