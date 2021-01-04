import { Some, None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "./token";

const { pow } = Math;
const { fromCharCode } = String;
const { map } = Parser;
const { and, or, not, equals } = Predicate;

export namespace Lexer {
  export function lex(input: string): Array<Token> {
    const points = new Array<number>(input.length);

    for (let i = 0, n = input.length; i < n; i++) {
      points[i] = input.charCodeAt(i);
    }

    const tokens: Array<Token> = [];

    let characters = Slice.of(points);

    while (true) {
      const result = lexToken(characters);

      if (result.isOk()) {
        const [remainder, token] = result.get();

        characters = remainder;

        tokens.push(token);
      } else {
        break;
      }
    }

    return tokens;
  }
}

const lexToken: Parser<Slice<number>, Token, string> = (input) => {
  if (input.length === 0) {
    return Err.of("Unexpected end of input");
  }

  const next = input.get(0).get();

  if (isNumeric(next)) {
    return lexNumeric(input);
  }

  if (next !== 0x3a && isNameStart(next)) {
    return lexName(input);
  }

  switch (next) {
    case 0x22:
    case 0x27:
      return lexString(input);

    case 0x28:
      if (input.get(1).includes(0x3a)) {
        return lexComment(input.slice(2));
      }
      break;

    case 0x2e: {
      if (input.get(1).some(isNumeric)) {
        return lexNumeric(input);
      }
    }
  }

  if (isCharacter(next)) {
    return Ok.of([input.slice(1), Token.Character.of(next)] as const);
  }

  return Err.of("Unexpected character");
};

const isBetween = (lower: number, upper: number): Predicate<number> => (char) =>
  char >= lower && char <= upper;

const isAlpha = or(isBetween(0x61, 0x7a), isBetween(0x41, 0x5a));

const isNumeric = isBetween(0x30, 0x39);

/**
 * @see https://www.w3.org/TR/xml/#NT-NameStartChar
 */
const isNameStart = or(
  equals(0x3a, 0x5f),
  isAlpha,
  isBetween(0xc0, 0xd6),
  isBetween(0xd8, 0xf6),
  isBetween(0xf8, 0x2ff),
  isBetween(0x370, 0x37d),
  isBetween(0x37f, 0x1fff),
  isBetween(0x200c, 0x200d),
  isBetween(0x2070, 0x218f),
  isBetween(0x2c00, 0x2fef),
  isBetween(0x3001, 0xd7ff),
  isBetween(0xf900, 0xfdcf),
  isBetween(0xfdf0, 0xfffd),
  isBetween(0x10000, 0xeffff)
);

/**
 * @see https://www.w3.org/TR/xml/#NT-NameChar
 */
const isName = or(
  equals(0x2d, 0x2e, 0xb7),
  isNameStart,
  isNumeric,
  isBetween(0x0300, 0x036f),
  isBetween(0x203f, 0x2040)
);

/**
 * @see https://www.w3.org/TR/xml-names/#NT-NCName
 */
const isNonColonName = and(not(equals(0x3a)), isName);

/**
 * @see https://www.w3.org/TR/xml/#NT-Char
 */
const isCharacter = or(
  equals(0x9, 0xa, 0xd),
  or(
    isBetween(0x20, 0xd7ff),
    or(isBetween(0xe000, 0xfffd), isBetween(0x10000, 0x10ffff))
  )
);

const lexNumeric: Parser<Slice<number>, Token, string> = (input) => {
  let value = 0;
  let next = input.get(0);

  while (next.some(isNumeric)) {
    value = value * 10 + next.get() - 0x30;

    input = input.slice(1);
    next = input.get(0);
  }

  let token: Token = Token.Integer.of(value);

  if (next.includes(0x2e)) {
    input = input.slice(1);
    next = input.get(0);

    let fraction = 0;
    let digits = 0;

    while (next.some(isNumeric)) {
      fraction = fraction * 10 + next.get() - 0x30;
      digits++;

      input = input.slice(1);
      next = input.get(0);
    }

    value = value + fraction / pow(10, digits);
    token = Token.Decimal.of(value);
  }

  if (next.includes(0x65) || next.includes(0x45)) {
    input = input.slice(1);
    next = input.get(0);

    let exponent = 0;
    let sign = -1;

    if (next.includes(0x2d) || next.includes(0x2b)) {
      if (next.includes(0x2d)) {
        sign = 1;
      }

      input = input.slice(1);
      next = input.get(0);
    }

    while (next.some(isNumeric)) {
      exponent = exponent * 10 + next.get() - 0x30;

      input = input.slice(1);
      next = input.get(0);
    }

    value = value / pow(10, sign * exponent);
    token = Token.Double.of(value);
  }

  return Ok.of([input, token] as const);
};

const lexString: Parser<Slice<number>, Token> = (input) => {
  const mark = input.get(0).get();

  input = input.slice(1);

  let value = "";
  let next = input.get(0);

  while (next.isSome()) {
    if (next.includes(mark)) {
      input = input.slice(1);
      next = input.get(0);

      if (next.includes(mark)) {
        value += fromCharCode(mark);

        input = input.slice(1);
        next = input.get(0);

        continue;
      }

      break;
    }

    value += fromCharCode(next.get());

    input = input.slice(1);
    next = input.get(0);
  }

  return Ok.of([input, Token.String.of(value)] as const);
};

const lexCommentContents: Parser<Slice<number>, string> = (input) => {
  let value = "";
  let next = input.get(0);

  while (next.isSome()) {
    switch (next.get()) {
      case 0x28:
        input = input.slice(1);
        value += "(";
        next = input.get(0);

        if (next.includes(0x3a)) {
          input = input.slice(1);
          value += ":";

          const [remainder, result] = lexCommentContents(input).get();

          value += result;

          input = remainder;
          next = input.get(0);
          continue;
        }
        break;

      case 0x3a:
        input = input.slice(1);
        value += ":";
        next = input.get(0);

        if (next.includes(0x29)) {
          return Ok.of([input.slice(1), value + ")"] as const);
        }
        break;

      default:
        input = input.slice(1);
        value += fromCharCode(next.get());
        next = input.get(0);
    }
  }

  return Ok.of([input, value] as const);
};

const lexComment = map(lexCommentContents, (value) => {
  const n = value.length;

  if (value.charCodeAt(n - 2) === 0x3a && value.charCodeAt(n - 1) === 0x29) {
    value = value.slice(0, n - 2);
  }

  return Token.Comment.of(value);
});

const lexName: Parser<Slice<number>, Token> = (input) => {
  let value = "";
  let next = input.get(0);

  while (next.some(isNonColonName)) {
    value += fromCharCode(next.get());
    input = input.slice(1);
    next = input.get(0);
  }

  if (next.includes(0x3a)) {
    next = input.get(1);

    if (next.some(and(not(equals(0x3a)), isNameStart))) {
      const prefix = value;
      value = "";

      input = input.slice(1);
      next = input.get(0);

      while (next.some(isNonColonName)) {
        value += fromCharCode(next.get());
        input = input.slice(1);
        next = input.get(0);
      }

      return Ok.of([input, Token.Name.of(Some.of(prefix), value)] as const);
    }
  }

  return Ok.of([input, Token.Name.of(None, value)] as const);
};
