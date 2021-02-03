import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Result, Err } from "@siteimprove/alfa-result";

import { Token } from "./token";

const { fromCharCode } = String;
const { zeroOrMore } = Parser;
const { or } = Predicate;

export namespace Lexer {
  export function lex(input: string): Array<Token> {
    const points = new Array<number>(input.length);

    for (let i = 0, n = input.length; i < n; i++) {
      points[i] = input.charCodeAt(i);
    }

    const tokens: Array<Token> = [];

    for (let i = 0, n = points.length; i < n; ) {
      const result = consumeToken([points, i]);

      if (result.isOk()) {
        let token: Token;

        [[, i], token] = result.get();

        tokens.push(token);
      } else {
        break;
      }
    }

    return tokens;
  }
}

/**
 * @see https://drafts.csswg.org/css-syntax/#digit
 */
const isDigit: Predicate<number> = (code) => code >= 0x30 && code <= 0x39;

const digit: Parser<[Array<number>, number], number, string> = ([input, i]) => {
  const code = input[i];

  return isDigit(code)
    ? Result.of([[input, i + 1], code])
    : Err.of("Expected a digit");
};

/**
 * @see https://drafts.csswg.org/css-syntax/#hex-digit
 */
const isHexDigit: Predicate<number> = (code) =>
  isDigit(code) ||
  (code >= 0x41 && code <= 0x46) ||
  (code >= 0x61 && code <= 0x66);

const hexDigit: Parser<[Array<number>, number], number, string> = ([
  input,
  i,
]) => {
  const code = input[i];

  return isHexDigit(code)
    ? Result.of([[input, i + 1], code])
    : Err.of("Expected a hex digit");
};

/**
 * @see https://drafts.csswg.org/css-syntax/#uppercase-letter
 */
const isUppercaseLetter: Predicate<number> = (code) =>
  code >= 0x41 && code <= 0x5a;

/**
 * @see https://drafts.csswg.org/css-syntax/#lowercase-letter
 */
const isLowercaseLetter: Predicate<number> = (code) =>
  code >= 0x61 && code <= 0x7a;

/**
 * @see https://drafts.csswg.org/css-syntax/#letter
 */
const isLetter = or(isUppercaseLetter, isLowercaseLetter);

/**
 * @see https://drafts.csswg.org/css-syntax/#non-ascii-code-point
 */
const isNonAscii: Predicate<number> = (code) => code >= 0x80;

/**
 * @see https://drafts.csswg.org/css-syntax/#newline
 */
const isNewline: Predicate<number> = (code) => code === 0xa;

/**
 * @see https://drafts.csswg.org/css-syntax/#whitespace
 */
const isWhitespace = or(isNewline, (code) => code === 0x9 || code === 0x20);

/**
 * @see https://drafts.csswg.org/css-syntax/#non-printable-code-point
 */
const isNonPrintable: Predicate<number> = (code) =>
  (code >= 0 && code <= 0x8) ||
  code === 0xb ||
  (code >= 0xe && code <= 0x1f) ||
  code === 0x7f;

/**
 * @see https://drafts.csswg.org/css-syntax/#name-start-code-point
 */
const isNameStart = or(
  isLetter,
  or(isNonAscii, (code) => code === 0x5f)
);

/**
 * @see https://drafts.csswg.org/css-syntax/#name-code-point
 */
const isName = or(
  isNameStart,
  or(isDigit, (code) => code === 0x2d)
);

/**
 * @see https://infra.spec.whatwg.org/#surrogate
 */
const isSurrogate: Predicate<number> = (code) =>
  code >= 0xd800 && code <= 0xdfff;

/**
 * @see https://drafts.csswg.org/css-syntax/#starts-with-a-valid-escape
 */
const startsValidEscape: Predicate<[Array<number>, number]> = ([input, i]) =>
  input[i] === 0x5c && !isNewline(input[i + 1]);

/**
 * @see https://drafts.csswg.org/css-syntax/#starts-with-a-number
 */
const startsNumber: Predicate<[Array<number>, number]> = ([input, i]) => {
  switch (input[i]) {
    case 0x2b:
    case 0x2d:
      if (input[i + 1] === 0x2e) {
        return isDigit(input[i + 3]);
      } else {
        return isDigit(input[i + 1]);
      }

    case 0x2e:
      return isDigit(input[i + 1]);

    default:
      return isDigit(input[i]);
  }
};

/**
 * @see https://drafts.csswg.org/css-syntax/#would-start-an-identifier
 */
const startsIdentifier: Predicate<[Array<number>, number]> = ([input, i]) => {
  switch (input[i]) {
    case 0x2d:
      return (
        isNameStart(input[i + 1]) ||
        input[i + 1] === 0x2d ||
        startsValidEscape([input, i + 1])
      );

    case 0x5c:
      return startsValidEscape([input, i]);

    default:
      return isNameStart(input[i]);
  }
};

/**
 * @see https://drafts.csswg.org/css-syntax/#consume-a-name
 */
const consumeName: Parser<[Array<number>, number], string> = ([input, i]) => {
  let name = "";

  for (const n = input.length; i < n; ) {
    const code = input[i];

    if (isName(code)) {
      i++;
      name += fromCharCode(code);
    } else if (startsValidEscape([input, i])) {
      let code: number;

      [[input, i], code] = consumeEscapedCodePoint([input, i + 1]).get();

      name += fromCharCode(code);
    } else {
      break;
    }
  }

  return Result.of([[input, i], name]);
};

/**
 * @see https://drafts.csswg.org/css-syntax/#consume-an-escaped-code-point
 */
const consumeEscapedCodePoint: Parser<[Array<number>, number], number> = ([
  input,
  i,
]) => {
  const byte = input[i];

  if (isNaN(byte)) {
    return Result.of([[input, i], 0xfffd]);
  }

  i++;

  if (isHexDigit(byte)) {
    const bytes = [byte];

    for (const n = i + 5; i < n; i++) {
      const result = hexDigit([input, i]);

      if (result.isErr()) {
        break;
      }

      const [, byte] = result.get();

      bytes.push(byte);
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

    if (isWhitespace(input[i])) {
      i++;
    }

    if (code === 0 || isSurrogate(code) || code > 0x10ffff) {
      return Result.of([[input, i], 0xfffd]);
    }

    return Result.of([[input, i], code]);
  }

  return Result.of([[input, i], byte]);
};

/**
 * @see https://drafts.csswg.org/css-syntax/#consume-a-number
 */
const consumeNumber: Parser<[Array<number>, number], Token.Number> = ([
  input,
  i,
]) => {
  const number: Array<number> = [];

  let code = input[i];

  let isSigned = false;
  let isInteger = true;

  if (code === 0x2b || code === 0x2d) {
    number.push(code);
    code = input[++i];
    isSigned = true;
  }

  while (isDigit(code)) {
    number.push(code);
    code = input[++i];
  }

  if (code === 0x2e && isDigit(input[i + 1])) {
    number.push(0x2e, input[i + 1]);
    code = input[(i += 2)];
    isInteger = false;

    while (isDigit(code)) {
      number.push(code);
      code = input[++i];
    }
  }

  if (code === 0x45 || code === 0x65) {
    let offset = 1;

    if (input[i + 1] === 0x2b || input[i + 1] === 0x2d) {
      offset = 2;
    }

    if (isDigit(input[i + offset])) {
      number.push(...input.slice(i, i + offset + 1));
      code = input[(i += offset + 1)];
      isInteger = false;

      while (isDigit(code)) {
        number.push(code);
        code = input[++i];
      }
    }
  }

  return Result.of([
    [input, i],
    Token.Number.of(convert(number), isInteger, isSigned),
  ]);
};

/**
 * @see https://drafts.csswg.org/css-syntax/#consume-a-numeric-token
 */
const consumeNumeric: Parser<
  [Array<number>, number],
  Token.Number | Token.Dimension | Token.Percentage
> = ([input, i]) => {
  let number: Token.Number;

  [[input, i], number] = consumeNumber([input, i]).get();

  if (startsIdentifier([input, i])) {
    let name: string;

    [[input, i], name] = consumeName([input, i]).get();

    return Result.of([
      [input, i],
      Token.Dimension.of(number.value, name, number.isInteger, number.isSigned),
    ]);
  }

  if (input[i] === 0x25) {
    return Result.of([
      [input, i + 1],
      Token.Percentage.of(number.value / 100, number.isInteger),
    ]);
  }

  return Result.of([[input, i], number]);
};

/**
 * @see https://drafts.csswg.org/css-syntax/#consume-an-ident-like-token
 */
const consumeIdentifierLike: Parser<
  [Array<number>, number],
  Token.Ident | Token.Function | Token.URL | Token.BadURL
> = ([input, i]) => {
  let string: string;

  [[input, i], string] = consumeName([input, i]).get();

  const code = input[i];

  if (string.toLowerCase() === "url" && code === 0x28) {
    i++;

    while (isWhitespace(input[i]) && isWhitespace(input[i + 1])) {
      i++;
    }

    if (
      input[i] === 0x22 ||
      input[i] === 0x27 ||
      (isWhitespace(input[i]) &&
        (input[i + 1] === 0x22 || input[i + 1] === 0x27))
    ) {
      return Result.of([[input, i], Token.Function.of(string)]);
    }

    return consumeURL([input, i]);
  }

  if (code === 0x28) {
    return Result.of([[input, i + 1], Token.Function.of(string)]);
  }

  return Result.of([[input, i], Token.Ident.of(string)]);
};

/**
 * @see https://drafts.csswg.org/css-syntax/#consume-a-string-token
 */
const consumeString: Parser<[Array<number>, number], Token.String> = ([
  input,
  i,
]) => {
  const end = input[i++];

  let string = "";

  while (i < input.length) {
    const code = input[i++];

    if (isNewline(code) || code === end) {
      break;
    }

    string += fromCharCode(code);
  }

  return Result.of([[input, i], Token.String.of(string)]);
};

/**
 * @see https://drafts.csswg.org/css-syntax/#consume-a-url-token
 */
const consumeURL: Parser<[Array<number>, number], Token.URL | Token.BadURL> = ([
  input,
  i,
]) => {
  while (isWhitespace(input[i])) {
    i++;
  }

  let value = "";

  while (i < input.length) {
    const code = input[i];

    if (code === 0x29) {
      i++;
      break;
    }

    if (isWhitespace(code)) {
      while (isWhitespace(input[i])) {
        i++;
      }

      if (input[i] === 0x29) {
        i++;
        break;
      } else {
        return consumeBadURL([input, i]);
      }
    }

    if (
      code === 0x22 ||
      code === 0x27 ||
      code === 0x28 ||
      isNonPrintable(code)
    ) {
      return consumeBadURL([input, i + 1]);
    }

    if (code === 0x5c) {
      if (startsValidEscape([input, i])) {
        let code: number;

        [[input, i], code] = consumeEscapedCodePoint([input, i]).get();

        value += fromCharCode(code);
        continue;
      } else {
        return consumeBadURL([input, i]);
      }
    }

    i++;
    value += fromCharCode(code);
  }

  return Result.of([[input, i], Token.URL.of(value)]);
};

/**
 * @see https://drafts.csswg.org/css-syntax/#consume-remnants-of-bad-url
 */
const consumeBadURL: Parser<[Array<number>, number], Token.BadURL> = ([
  input,
  i,
]) => {
  while (i < input.length) {
    if (startsValidEscape([input, i])) {
      [[input, i]] = consumeEscapedCodePoint([input, i]).get();
    } else {
      const code = input[i++];

      if (code === 0x29) {
        break;
      }
    }
  }

  return Result.of([[input, i], Token.BadURL.of()]);
};

/**
 * @see https://drafts.csswg.org/css-syntax/#consume-comments
 */
const consumeComments: Parser<[Array<number>, number], void> = ([input, i]) => {
  while (i < input.length) {
    if (input[i] === 0x2f && input[i + 1] === 0x2a) {
      i += 2;

      while (i < input.length) {
        if (input[i] === 0x2a && input[i + 1] === 0x2f) {
          i += 2;
          break;
        }

        i++;
      }
    } else {
      break;
    }
  }

  return Result.of([[input, i], undefined]);
};

/**
 * @see https://drafts.csswg.org/css-syntax/#consume-a-token
 */
const consumeToken: Parser<[Array<number>, number], Token, string> = ([
  input,
  i,
]) => {
  for ([[input, i]] of consumeComments([input, i])) {
  }

  if (i >= input.length) {
    return Err.of("Unexpected end of input");
  }

  const code = input[i];

  if (isWhitespace(code)) {
    i++;

    while (isWhitespace(input[i])) {
      i++;
    }

    return Result.of([[input, i], Token.Whitespace.of()]);
  }

  if (isNameStart(code)) {
    return consumeIdentifierLike([input, i]);
  }

  if (isDigit(code)) {
    return consumeNumeric([input, i]);
  }

  switch (code) {
    case 0x22:
      return consumeString([input, i]);

    case 0x23:
      i++;

      if (isName(input[i]) || startsValidEscape([input, i])) {
        const isIdentifier = startsIdentifier([input, i]);

        let name: string;

        [[input, i], name] = consumeName([input, i]).get();

        return Result.of([[input, i], Token.Hash.of(name, isIdentifier)]);
      }

      return Result.of([[input, i + 1], Token.Delim.of(code)]);

    case 0x27:
      return consumeString([input, i]);

    case 0x28:
      return Result.of([[input, i + 1], Token.OpenParenthesis.of()]);

    case 0x29:
      return Result.of([[input, i + 1], Token.CloseParenthesis.of()]);

    case 0x2b:
      if (startsNumber([input, i])) {
        return consumeNumeric([input, i]);
      }

      return Result.of([[input, i + 1], Token.Delim.of(code)]);

    case 0x2c:
      return Result.of([[input, i + 1], Token.Comma.of()]);

    case 0x2d:
      if (startsNumber([input, i])) {
        return consumeNumeric([input, i]);
      }

      if (input[i + 1] === 0x2d && input[i + 2] === 0x3e) {
        return Result.of([[input, i + 3], Token.CloseComment.of()]);
      }

      if (startsIdentifier([input, i])) {
        return consumeIdentifierLike([input, i]);
      }

      return Result.of([[input, i + 1], Token.Delim.of(code)]);

    case 0x2e:
      if (startsNumber([input, i])) {
        return consumeNumeric([input, i]);
      }

      return Result.of([[input, i + 1], Token.Delim.of(code)]);

    case 0x3a:
      return Result.of([[input, i + 1], Token.Colon.of()]);

    case 0x3b:
      return Result.of([[input, i + 1], Token.Semicolon.of()]);

    case 0x3c:
      if (
        input[i + 1] === 0x21 &&
        input[i + 2] === 0x2d &&
        input[i + 3] === 0x2d
      ) {
        return Result.of([[input, i + 4], Token.OpenComment.of()]);
      }

      return Result.of([[input, i + 1], Token.Delim.of(code)]);

    case 0x40:
      i++;

      if (startsIdentifier([input, i])) {
        let name: string;

        [[input, i], name] = consumeName([input, i]).get();

        return Result.of([[input, i], Token.AtKeyword.of(name)]);
      }

      return Result.of([[input, i], Token.Delim.of(code)]);

    case 0x5b:
      return Result.of([[input, i + 1], Token.OpenSquareBracket.of()]);

    case 0x5c:
      if (startsValidEscape([input, i])) {
        return consumeIdentifierLike([input, i]);
      }

      return Result.of([[input, i + 1], Token.Delim.of(code)]);

    case 0x5d:
      return Result.of([[input, i + 1], Token.CloseSquareBracket.of()]);

    case 0x7b:
      return Result.of([[input, i + 1], Token.OpenCurlyBracket.of()]);

    case 0x7d:
      return Result.of([[input, i + 1], Token.CloseCurlyBracket.of()]);
  }

  return Result.of([[input, i + 1], Token.Delim.of(code)]);
};

/**
 * @see https://drafts.csswg.org/css-syntax/#convert-a-string-to-a-number
 */
function convert(input: Array<number>): number {
  let i = 0;

  let s = input[i] === 0x2d ? -1 : input[i] === 0x2b ? 1 : null;

  if (s !== null) {
    i++;
  } else {
    s = 1;
  }

  let n: Iterable<number>;

  let v = 0;

  for ([[input, i], n] of zeroOrMore(digit)([input, i])) {
    v = [...n].reduce((v, c) => 10 * v + (c - 0x30), v);
  }

  if (input[i] === 0x2e) {
    i++;
  }

  let f = 0;
  let d = 0;

  for ([[input, i], n] of zeroOrMore(digit)([input, i])) {
    [f, d] = [...n].reduce(([f, d], c) => [10 * f + (c - 0x30), d + 1], [f, d]);
  }

  if (input[i] === 0x45 || input[i] === 0x65) {
    i++;
  }

  let t = input[i] === 0x2d ? -1 : input[i] === 0x2b ? 1 : null;

  if (t !== null) {
    i++;
  } else {
    t = 1;
  }

  let e = 0;

  for ([[input, i], n] of zeroOrMore(digit)([input, i])) {
    e = [...n].reduce((e, c) => 10 * e + (c - 0x30), e);
  }

  // To account for floating point precision errors, we flip the sign of the
  // exponents (`d` and `t`) and divide rather than multiply.
  return (s * (v + f / 10 ** d)) / 10 ** (-t * e);
}
