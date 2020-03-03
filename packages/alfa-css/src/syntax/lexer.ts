import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "./token";

const { map } = Iterable;
const { zeroOrMore, take } = Parser;
const { and, or, not, equals } = Predicate;

export namespace Lexer {
  export function* lex(input: string): Iterable<Token> {
    const points = new Array(input.length);

    for (let i = 0, n = input.length; i < n; i++) {
      points[i] = input.charCodeAt(i);
    }

    let characters = Slice.of(points);

    while (true) {
      const result = consumeToken(characters);

      if (result.isOk()) {
        const [remainder, token] = result.get();

        characters = remainder;

        yield token;
      } else {
        break;
      }
    }
  }
}

/**
 * @see https://drafts.csswg.org/css-syntax/#digit
 */
const isDigit: Predicate<number> = code => code >= 0x30 && code <= 0x39;

const digit: Parser<Slice<number>, number, string> = input => {
  const code = input.get(0).getOr(-1);

  return isDigit(code)
    ? Ok.of([input.slice(1), code] as const)
    : Err.of("Expected a digit");
};

/**
 * @see https://drafts.csswg.org/css-syntax/#hex-digit
 */
const isHexDigit: Predicate<number> = code =>
  isDigit(code) ||
  (code >= 0x41 && code <= 0x46) ||
  (code >= 0x61 && code <= 0x66);

const hexDigit: Parser<Slice<number>, number, string> = input => {
  const code = input.get(0).getOr(-1);

  return isHexDigit(code)
    ? Ok.of([input.slice(1), code] as const)
    : Err.of("Expected a hex digit");
};

/**
 * @see https://drafts.csswg.org/css-syntax/#uppercase-letter
 */
const isUppercaseLetter: Predicate<number> = code =>
  code >= 0x41 && code <= 0x5a;

/**
 * @see https://drafts.csswg.org/css-syntax/#lowercase-letter
 */
const isLowercaseLetter: Predicate<number> = code =>
  code >= 0x61 && code <= 0x7a;

/**
 * @see https://drafts.csswg.org/css-syntax/#letter
 */
const isLetter: Predicate<number> = or(isUppercaseLetter, isLowercaseLetter);

/**
 * @see https://drafts.csswg.org/css-syntax/#non-ascii-code-point
 */
const isNonAscii: Predicate<number> = code => code >= 0x80;

/**
 * @see https://drafts.csswg.org/css-syntax/#newline
 */
const isNewline: Predicate<number> = equals(0xa);

/**
 * @see https://drafts.csswg.org/css-syntax/#whitespace
 */
const isWhitespace: Predicate<number> = or(isNewline, equals(0x9, 0x20));

/**
 * @see https://drafts.csswg.org/css-syntax/#non-printable-code-point
 */
const isNonPrintable: Predicate<number> = code =>
  (code >= 0 && code <= 0x8) ||
  code === 0xb ||
  (code >= 0xe && code <= 0x1f) ||
  code === 0x7f;

/**
 * @see https://drafts.csswg.org/css-syntax/#name-start-code-point
 */
const isNameStart: Predicate<number> = or(
  isLetter,
  or(isNonAscii, equals(0x5f))
);

/**
 * @see https://drafts.csswg.org/css-syntax/#name-code-point
 */
const isName: Predicate<number> = or(isNameStart, or(isDigit, equals(0x2d)));

/**
 * @see https://infra.spec.whatwg.org/#surrogate
 */
const isSurrogate: Predicate<number> = code => code >= 0xd800 && code <= 0xdfff;

/**
 * @see https://drafts.csswg.org/css-syntax/#starts-with-a-valid-escape
 */
const startsValidEscape: Predicate<Slice<number>> = input =>
  input
    .get(0)
    .some(and(equals(0x5c), () => input.get(1).every(not(isNewline))));

/**
 * @see https://drafts.csswg.org/css-syntax/#starts-with-a-number
 */
const startsNumber: Predicate<Slice<number>> = input =>
  input.get(0).some(
    or(
      isDigit,
      or(
        and(equals(0x2e), () => input.get(1).some(isDigit)),
        and(equals(0x2b, 0x2d), () =>
          input.get(1).some(
            or(
              isDigit,
              and(equals(0x2e), () => input.get(2).some(isDigit))
            )
          )
        )
      )
    )
  );

/**
 * @see https://drafts.csswg.org/css-syntax/#would-start-an-identifier
 */
const startsIdentifier: Predicate<Slice<number>> = input =>
  input.get(0).some(
    or(
      isNameStart,
      or(
        and(equals(0x2d), () =>
          input
            .get(1)
            .every(
              or(or(isNameStart, equals(0x2d)), () =>
                startsValidEscape(input.slice(1))
              )
            )
        ),
        and(equals(0x5c), () => startsValidEscape(input))
      )
    )
  );

/**
 * @see https://drafts.csswg.org/css-syntax/#consume-a-name
 */
const consumeName: Parser<Slice<number>, string> = input => {
  let name: Array<number> = [];

  while (input.length > 0) {
    const code = input.get(0).getOr(-1);

    if (isName(code)) {
      input = input.slice(1);
      name.push(code);
    } else if (startsValidEscape(input)) {
      const [remainder, code] = consumeEscapedCodePoint(input.slice(1)).get();

      input = remainder;
      name.push(code);
    } else {
      break;
    }
  }

  return Ok.of([input, String.fromCharCode(...name)] as const);
};

/**
 * @see https://drafts.csswg.org/css-syntax/#consume-an-escaped-code-point
 */
const consumeEscapedCodePoint: Parser<Slice<number>, number> = input => {
  const byte = input.get(0).getOr(-1);

  if (byte === -1) {
    return Ok.of([input, 0xfffd] as const);
  }

  if (isHexDigit(byte)) {
    const bytes = [byte];

    for (const [remainder, byte] of take(hexDigit, 5)(input.slice(1))) {
      input = remainder;
      bytes.push(...byte);
    }

    let code = 0;

    for (let i = 0, n = bytes.length; i < n; i++) {
      let byte = bytes[i];

      if (isDigit(byte)) {
        byte = byte - 0x30;
      } else if (isLowercaseLetter(byte)) {
        byte = byte - 0x61 + 10;
      } else if (isUppercaseLetter(byte)) {
        byte = byte - 0x41 + 10;
      }

      code = 0x10 * code + byte;
    }

    if (input.get(0).every(isWhitespace)) {
      input = input.slice(1);
    }

    if (code === 0 || isSurrogate(code) || code > 0x10ffff) {
      return Ok.of([input, 0xfffd] as const);
    }

    return Ok.of([input, code] as const);
  }

  return Ok.of([input.slice(1), byte] as const);
};

/**
 * @see https://drafts.csswg.org/css-syntax/#consume-a-number
 */
const consumeNumber: Parser<Slice<number>, Token.Number> = input => {
  const number: Array<number> = [];

  let code = input.get(0);

  let isSigned = false;
  let isInteger = true;

  if (code.some(equals(0x2b, 0x2d))) {
    number.push(code.get());
    input = input.slice(1);
    code = input.get(0);
    isSigned = true;
  }

  while (code.some(isDigit)) {
    number.push(code.get());
    input = input.slice(1);
    code = input.get(0);
  }

  if (code.some(equals(0x2e)) && input.get(1).some(isDigit)) {
    number.push(0x2e, input.get(1).get());
    input = input.slice(2);
    code = input.get(0);
    isInteger = false;

    while (code.some(isDigit)) {
      number.push(code.get());
      input = input.slice(1);
      code = input.get(0);
    }
  }

  if (code.some(equals(0x45, 0x65))) {
    let offset = 1;

    if (input.get(1).some(equals(0x2b, 0x2d))) {
      offset = 2;
      isSigned = true;
    }

    if (input.get(offset).some(isDigit)) {
      number.push(...input.slice(0, offset + 1));
      input = input.slice(offset);
      code = input.get(0);
      isInteger = false;

      while (code.some(isDigit)) {
        number.push(code.get());
        input = input.slice(1);
        code = input.get(0);
      }
    }
  }

  return Ok.of([
    input,
    Token.Number.of(convert(Slice.of(number)), isInteger, isSigned)
  ] as const);
};

/**
 * @see https://drafts.csswg.org/css-syntax/#consume-a-numeric-token
 */
const consumeNumeric: Parser<
  Slice<number>,
  Token.Number | Token.Dimension | Token.Percentage
> = input => {
  const [remainder, number] = consumeNumber(input).get();
  input = remainder;

  if (startsIdentifier(input)) {
    const [remainder, name] = consumeName(input).get();

    return Ok.of([
      remainder,
      Token.Dimension.of(number.value, name, number.isInteger, number.isSigned)
    ] as const);
  }

  if (input.get(0).includes(0x25)) {
    return Ok.of([
      input.slice(1),
      Token.Percentage.of(number.value / 100, number.isInteger)
    ] as const);
  }

  return Ok.of([input, number] as const);
};

/**
 * @see https://drafts.csswg.org/css-syntax/#consume-an-ident-like-token
 */
const consumeIdentifierLike: Parser<
  Slice<number>,
  Token.Ident | Token.Function | Token.URL | Token.BadURL
> = input => {
  const [remainder, string] = consumeName(input).get();
  input = remainder;

  const code = input.get(0);

  if (string.toLowerCase() === "url" && code.includes(0x28)) {
    input = input.slice(1);

    while (input.get(0).some(isWhitespace) && input.get(1).some(isWhitespace)) {
      input = input.slice(1);
    }

    if (
      input.get(0).some(
        or(
          equals(0x22, 0x27),
          and(isWhitespace, () => input.get(1).some(equals(0x22, 0x27)))
        )
      )
    ) {
      return Ok.of([input, Token.Function.of(string)] as const);
    }

    return consumeURL(input.slice(1));
  }

  if (code.includes(0x28)) {
    return Ok.of([input.slice(1), Token.Function.of(string)] as const);
  }

  return Ok.of([input, Token.Ident.of(string)] as const);
};

/**
 * @see https://drafts.csswg.org/css-syntax/#consume-a-string-token
 */
const consumeString: Parser<Slice<number>, Token.String> = input => {
  const end = input.get(0).get();

  input = input.slice(1);

  let string: Array<number> = [];

  while (true) {
    const code = input.get(0);

    input = input.slice(1);

    if (code.every(or(isNewline, equals(end)))) {
      break;
    }

    string.push(code.get());
  }

  return Ok.of([
    input,
    Token.String.of(String.fromCharCode(...string))
  ] as const);
};

/**
 * @see https://drafts.csswg.org/css-syntax/#consume-a-url-token
 */
const consumeURL: Parser<Slice<number>, Token.URL | Token.BadURL> = input => {
  while (input.get(0).some(isWhitespace)) {
    input = input.slice(1);
  }

  let value: Array<number> = [];

  while (true) {
    const code = input.get(0);

    if (code.every(equals(0x29))) {
      input = input.slice(1);
      break;
    }

    if (code.some(isWhitespace)) {
      while (input.get(0).some(isWhitespace)) {
        input = input.slice(1);
      }

      if (input.get(0).every(equals(0x29))) {
        input = input.slice(1);
        break;
      } else {
        return consumeBadURL(input);
      }
    }

    if (code.some(or(equals(0x22, 0x27, 0x28), isNonPrintable))) {
      return consumeBadURL(input.slice(1));
    }

    if (code.includes(0x5c)) {
      if (startsValidEscape(input)) {
        const [remainder, code] = consumeEscapedCodePoint(input).get();
        input = remainder;
        value.push(code);
        continue;
      } else {
        return consumeBadURL(input.slice(1));
      }
    }

    input = input.slice(1);
    value.push(code.get());
  }

  return Ok.of([input, Token.URL.of(String.fromCharCode(...value))] as const);
};

/**
 * @see https://drafts.csswg.org/css-syntax/#consume-remnants-of-bad-url
 */
const consumeBadURL: Parser<Slice<number>, Token.BadURL> = input => {
  while (true) {
    if (startsValidEscape(input)) {
      const [remainder] = consumeEscapedCodePoint(input).get();
      input = remainder;
    } else {
      const code = input.get(0);

      input = input.slice(1);

      if (code.every(equals(0x29))) {
        break;
      }
    }
  }

  return Ok.of([input, Token.BadURL.of()] as const);
};

/**
 * @see https://drafts.csswg.org/css-syntax/#consume-comments
 */
const consumeComments: Parser<Slice<number>, void> = input => {
  while (true) {
    if (input.get(0).includes(0x2f) && input.get(1).includes(0x2a)) {
      input = input.slice(2);

      while (true) {
        if (input.length === 0) {
          break;
        }

        if (input.get(0).includes(0x2a) && input.get(1).includes(0x2f)) {
          input = input.slice(2);
          break;
        }

        input = input.slice(1);
      }
    } else {
      break;
    }
  }

  return Ok.of([input, undefined] as const);
};

const delims = new Map<string, Token.Delim>();

/**
 * @see https://drafts.csswg.org/css-syntax/#consume-a-token
 */
const consumeToken: Parser<Slice<number>, Token, string> = input => {
  for (const [remainder] of consumeComments(input)) {
    input = remainder;
  }

  if (input.length === 0) {
    return Err.of("Unexpected end of input");
  }

  const code = input.get(0).get();

  if (isWhitespace(code)) {
    input = input.slice(1);

    while (input.get(0).some(isWhitespace)) {
      input = input.slice(1);
    }

    return Ok.of([input, Token.Whitespace.of()] as const);
  }

  switch (code) {
    case 0x22:
      return consumeString(input);

    case 0x23:
      input = input.slice(1);

      if (input.get(0).some(isName) || startsValidEscape(input)) {
        const isIdentifier = startsIdentifier(input);

        const [remainder, name] = consumeName(input).get();
        input = remainder;

        return Ok.of([input, Token.Hash.of(name, isIdentifier)] as const);
      }

    case 0x27:
      return consumeString(input);

    case 0x28:
      return Ok.of([input.slice(1), Token.OpenParenthesis.of()] as const);

    case 0x29:
      return Ok.of([input.slice(1), Token.CloseParenthesis.of()] as const);

    case 0x2b:
      if (startsNumber(input)) {
        return consumeNumeric(input);
      }

      return Ok.of([input.slice(1), Token.Delim.of(code)] as const);

    case 0x2c:
      return Ok.of([input.slice(1), Token.Comma.of()] as const);

    case 0x2d:
      if (startsNumber(input)) {
        return consumeNumeric(input);
      }

      if (input.get(1).includes(0x2d) && input.get(2).includes(0x3e)) {
        return Ok.of([input.slice(3), Token.CloseComment.of()] as const);
      }

      if (startsIdentifier(input)) {
        return consumeIdentifierLike(input);
      }

      return Ok.of([input.slice(1), Token.Delim.of(code)] as const);

    case 0x2e:
      if (startsNumber(input)) {
        return consumeNumeric(input);
      }

      return Ok.of([input.slice(1), Token.Delim.of(code)] as const);

    case 0x3a:
      return Ok.of([input.slice(1), Token.Colon.of()] as const);

    case 0x3b:
      return Ok.of([input.slice(1), Token.Semicolon.of()] as const);

    case 0x3c:
      if (
        input.get(1).includes(0x21) &&
        input.get(2).includes(0x2d) &&
        input.get(3).includes(0x2d)
      ) {
        return Ok.of([input.slice(4), Token.OpenComment.of()] as const);
      }

      return Ok.of([input.slice(1), Token.Delim.of(code)] as const);

    case 0x40:
      input = input.slice(1);

      if (startsIdentifier(input)) {
        const [remainder, name] = consumeName(input).get();

        return Ok.of([remainder, Token.AtKeyword.of(name)] as const);
      }

      return Ok.of([input, Token.Delim.of(code)] as const);

    case 0x5b:
      return Ok.of([input.slice(1), Token.OpenSquareBracket.of()] as const);

    case 0x5c:
      if (startsValidEscape(input)) {
        return consumeIdentifierLike(input);
      }

      return Ok.of([input.slice(1), Token.Delim.of(code)] as const);

    case 0x5d:
      return Ok.of([input.slice(1), Token.CloseSquareBracket.of()] as const);

    case 0x7b:
      return Ok.of([input.slice(1), Token.OpenCurlyBracket.of()] as const);

    case 0x7d:
      return Ok.of([input.slice(1), Token.CloseCurlyBracket.of()] as const);
  }

  if (isDigit(code)) {
    return consumeNumeric(input);
  }

  if (isNameStart(code)) {
    return consumeIdentifierLike(input);
  }

  return Ok.of([input.slice(1), Token.Delim.of(code)] as const);
};

/**
 * @see https://drafts.csswg.org/css-syntax/#convert-a-string-to-a-number
 */
function convert(input: Slice<number>): number {
  const sign = input
    .get(0)
    .filter(equals(0x2b, 0x2d))
    .map(sign => (sign === 0x2d ? -1 : 1));

  if (sign.isSome()) {
    input = input.slice(1);
  }

  const s = sign.getOr(1);

  const integer: Array<number> = [];

  for (const [remainder, value] of zeroOrMore(digit)(input)) {
    input = remainder;
    integer.push(...value);
  }

  const i = integer
    .map(code => code - 0x30)
    .reduce((i, code) => 10 * i + code, 0);

  if (input.get(0).includes(0x2e)) {
    input = input.slice(1);
  }

  const fraction: Array<number> = [];

  for (const [remainder, value] of zeroOrMore(digit)(input)) {
    input = remainder;
    fraction.push(...value);
  }

  const f = fraction
    .map(code => code - 0x30)
    .reduce((i, code) => 10 * i + code, 0);

  const d = fraction.length;

  if (input.get(0).some(equals(0x45, 0x65))) {
    input = input.slice(1);
  }

  const exponentSign = input
    .get(0)
    .filter(equals(0x2b, 0x2d))
    .map(sign => (sign === 0x2d ? -1 : 1));

  if (exponentSign.isSome()) {
    input = input.slice(1);
  }

  const t = exponentSign.getOr(1);

  const exponent: Array<number> = [];

  for (const [remainder, value] of zeroOrMore(digit)(input)) {
    input = remainder;
    exponent.push(...value);
  }

  const e = exponent
    .map(code => code - 0x30)
    .reduce((i, code) => 10 * i + code, 0);

  // To account for floating point precision errors, we flip the sign of the
  // exponents (`d` and `t`) and divide rather than multiply.
  return (s * (i + f / 10 ** d)) / 10 ** (-t * e);
}
