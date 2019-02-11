import { Stream } from "@siteimprove/alfa-lang";
import { Token, TokenType } from "../alphabet";
import { AnBMicrosyntax } from "../types";

export function AnBMicrosyntax(stream: Stream<Token>): AnBMicrosyntax | null {
  const next = stream.peek(0);

  if (next === null) {
    return null;
  }

  console.log(`---`);
  console.log(`First: ${JSON.stringify(stream.peek(0))}`);
  stream.accept(token => token.type === TokenType.Whitespace);
  console.log(`Second: ${JSON.stringify(stream.peek(0))}`);

  const oddEven = getAnBFromOddEven(stream);

  if (oddEven !== null) {
    return oddEven;
  }

  if (next.type === TokenType.Ident) {
    return getAnBFromString(stream);
  }

  return getAnB(stream);
}

function getAnBFromOddEven(stream: Stream<Token>): AnBMicrosyntax | null {
  const next = stream.peek(0);

  if (next === null || next.type !== TokenType.Ident) {
    return null;
  }

  switch (next.value) {
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

function getAnB(stream: Stream<Token>): AnBMicrosyntax | null {
  let next = stream.peek(0);

  if (next === null) {
    return null;
  }

  let a = 0;
  let b = 0;

  console.log(JSON.stringify(next));

  switch (next.type) {
    case TokenType.Dimension:
      if (next.unit !== "n") {
        return null;
      }

      a = next.value;

      next = stream.next();
      stream.accept(token => token.type === TokenType.Whitespace);
  }

  next = stream.peek(0);
  console.log(JSON.stringify(next));

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

function getAnBFromString(stream: Stream<Token>): AnBMicrosyntax | null {
  const next = stream.peek(0);

  if (next === null || next.type !== TokenType.Ident) {
    return null;
  }

  let a = 0;
  const b = 0;

  if (next.value === "n") {
    a = 1;
  }

  return {
    a,
    b
  };
}
