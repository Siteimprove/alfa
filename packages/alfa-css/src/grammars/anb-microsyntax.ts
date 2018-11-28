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

  if (next.type === TokenType.Ident) {
    const oddEven = oddEvenSyntax(next.value);

    if (oddEven !== null) {
      return oddEven;
    }

    if (next.value !== "n") {
      return null;
    }
  } else {
    switch (next.type) {
      case TokenType.Number:
        // Keep "a" as 0
        break;
      case TokenType.Dimension:
        a = next.value;
        break;
      default:
        return null;
    }
  }

  next = stream.next();

  if (next === null || next.type !== TokenType.Number) {
    return null;
  }

  b = next.value;

  return {
    a,
    b
  };
}

export function oddEvenSyntax(ident: string): AnBMicrosyntax | null {
  let a = 0;
  let b = 0;

  switch (ident) {
    case "odd":
      a = 2;
      b = 1;
      break;
    case "even":
      a = 2;
      b = 0;
      break;
    default:
      return null;
  }

  return {
    a,
    b
  };
}
