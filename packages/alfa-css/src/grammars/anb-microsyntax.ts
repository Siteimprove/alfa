import { Stream } from "@siteimprove/alfa-lang";
import { Token, TokenType } from "../alphabet";
import { AnBMicrosyntax } from "../types";

export function AnBMicrosyntax(stream: Stream<Token>): AnBMicrosyntax | null {
  const next = stream.peek(0);

  if (next === null) {
    return null;
  }

  stream.accept(
    token =>
      token.type === TokenType.Whitespace || token.type === TokenType.Delim
  );

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

  switch (next.type) {
    case TokenType.Dimension:
      if (!next.unit.startsWith("n") && !next.unit.startsWith("-")) {
        return null;
      }

      a = next.value;

      if (next.unit.length > (next.unit.startsWith("-") ? 2 : 1)) {
        b = Number.parseInt(
          next.unit.substring(next.unit.startsWith("-") ? 2 : 1)
        );
      }

      next = stream.next();
      stream.accept(
        token =>
          token.type === TokenType.Whitespace || token.type === TokenType.Delim
      );
  }

  next = stream.peek(0);

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
  let next = stream.peek(0);

  if (next === null || next.type !== TokenType.Ident) {
    return null;
  }

  let a = 0;
  let b = 0;

  if (next.value.startsWith("n")) {
    a = 1;
    if (next.value.length > 1) {
      b = Number.parseInt(next.value.substring(1));
    }
  }

  if (next.value.startsWith("-n")) {
    a = 1;
    if (next.value.length > 2) {
      b = Number.parseInt(next.value.substring(2));
    }
  }

  next = stream.peek(1);

  if (next !== null && next.type === TokenType.Number) {
    stream.advance(1);
    b = next.value;
  }

  if (b === -0) {
    b = 0;
  }

  return {
    a,
    b
  };
}
