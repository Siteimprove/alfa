import { Parser } from "@siteimprove/alfa-parser";
import type { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "./token.js";

const { fromCharCode } = String;

/** `\0` */
const CHAR_NULL = 0x00;
const CHAR_BACKSPACE = 0x08;
/** `\t` */
const CHAR_TAB = 0x09;
/** `\n` */
const CHAR_NEWLINE = 0x0a;
const CHAR_VERTICAL_TAB = 0x0b;
const CHAR_SHIFT_OUT = 0x0e;
const CHAR_UNIT_SEPARATOR = 0x1f;
const CHAR_SPACE = 0x20;
/** `!` */
const CHAR_EXCLAMATION = 0x21;
/** `"` */
const CHAR_DOUBLE_QUOTE = 0x22;
/** `#` */
const CHAR_HASH = 0x23;
/** `%` */
const CHAR_PERCENT = 0x25;
/** `'` */
const CHAR_SINGLE_QUOTE = 0x27;
/** `(` */
const CHAR_OPEN_PAREN = 0x28;
/** `)` */
const CHAR_CLOSE_PAREN = 0x29;
/** `*` */
const CHAR_ASTERISK = 0x2a;
/** `+` */
const CHAR_PLUS = 0x2b;
/** `,` */
const CHAR_COMMA = 0x2c;
/** `-` */
const CHAR_MINUS = 0x2d;
/** `.` */
const CHAR_DOT = 0x2e;
/** `/` */
const CHAR_SLASH = 0x2f;
/** `0` */
const CHAR_ZERO = 0x30;
/** `9` */
const CHAR_NINE = 0x39;
/** `:` */
const CHAR_COLON = 0x3a;
/** `;` */
const CHAR_SEMICOLON = 0x3b;
/** `<` */
const CHAR_LESS_THAN = 0x3c;
/** `>` */
const CHAR_GREATER_THAN = 0x3e;
/** `@` */
const CHAR_AT = 0x40;
/** `A` */
const CHAR_UPPER_A = 0x41;
/** `E` */
const CHAR_UPPER_E = 0x45;
/** `F` */
const CHAR_UPPER_F = 0x46;
/** `L` */
const CHAR_UPPER_L = 0x4c;
/** `R` */
const CHAR_UPPER_R = 0x52;
/** `U` */
const CHAR_UPPER_U = 0x55;
/** `Z` */
const CHAR_UPPER_Z = 0x5a;
/** `[` */
const CHAR_OPEN_BRACKET = 0x5b;
/** `\` */
const CHAR_BACKSLASH = 0x5c;
/** `]` */
const CHAR_CLOSE_BRACKET = 0x5d;
/** `_` */
const CHAR_UNDERSCORE = 0x5f;
/** `a` */
const CHAR_LOWER_A = 0x61;
/** `e` */
const CHAR_LOWER_E = 0x65;
/** `f` */
const CHAR_LOWER_F = 0x66;
/** `l` */
const CHAR_LOWER_L = 0x6c;
/** `r` */
const CHAR_LOWER_R = 0x72;
/** `u` */
const CHAR_LOWER_U = 0x75;
/** `z` */
const CHAR_LOWER_Z = 0x7a;
/** `{` */
const CHAR_OPEN_BRACE = 0x7b;
/** `}` */
const CHAR_CLOSE_BRACE = 0x7d;
const CHAR_DELETE = 0x7f;
const CHAR_NON_ASCII = 0x80;
const CHAR_HEX_BASE = 0x10;
const CHAR_REPLACEMENT = 0xfffd;
const CHAR_SURROGATE_MIN = 0xd800;
const CHAR_SURROGATE_MAX = 0xdfff;
const CHAR_MAX_CODEPOINT = 0x10ffff;

/**
 * @public
 */
export namespace Lexer {
  export function lex(input: string): Slice<Token> {
    const tokens: Array<Token> = [];
    const n = input.length;

    for (let i = 0; i < n; ) {
      let token: Token | null;

      [[, i], token] = consumeToken([input, i]);

      if (token === null) {
        break;
      }

      tokens.push(token);
    }

    return Slice.of(tokens);
  }
}

/**
 * {@link https://drafts.csswg.org/css-syntax/#digit}
 */
const isDigit: Predicate<number> = (code) => code >= CHAR_ZERO && code <= CHAR_NINE;

/**
 * {@link https://drafts.csswg.org/css-syntax/#hex-digit}
 */
const isHexDigit: Predicate<number> = (code) =>
  isDigit(code) ||
  (code >= CHAR_UPPER_A && code <= CHAR_UPPER_F) ||
  (code >= CHAR_LOWER_A && code <= CHAR_LOWER_F);

const hexDigit: Parser<[string, number], number, string> = ([input, i]) => {
  const code = input.charCodeAt(i);
  return isHexDigit(code)
    ? Result.of([[input, i + 1], code])
    : Err.of("Expected a hex digit");
};

/**
 * {@link https://drafts.csswg.org/css-syntax/#uppercase-letter}
 */
const isUppercaseLetter: Predicate<number> = (code) =>
  code >= CHAR_UPPER_A && code <= CHAR_UPPER_Z;

/**
 * {@link https://drafts.csswg.org/css-syntax/#lowercase-letter}
 */
const isLowercaseLetter: Predicate<number> = (code) =>
  code >= CHAR_LOWER_A && code <= CHAR_LOWER_Z;

/**
 * {@link https://drafts.csswg.org/css-syntax/#letter}
 */
const isLetter: Predicate<number> = (code) =>
  isUppercaseLetter(code) || isLowercaseLetter(code);

/**
 * {@link https://drafts.csswg.org/css-syntax/#non-ascii-code-point}
 */
const isNonAscii: Predicate<number> = (code) => code >= CHAR_NON_ASCII;

/**
 * {@link https://drafts.csswg.org/css-syntax/#newline}
 */
const isNewline: Predicate<number> = (code) => code === CHAR_NEWLINE;

/**
 * {@link https://drafts.csswg.org/css-syntax/#whitespace}
 */
const isWhitespace: Predicate<number> = (code) =>
  isNewline(code) || code === CHAR_TAB || code === CHAR_SPACE;

/**
 * {@link https://drafts.csswg.org/css-syntax/#non-printable-code-point}
 */
const isNonPrintable: Predicate<number> = (code) =>
  (code >= CHAR_NULL && code <= CHAR_BACKSPACE) ||
  code === CHAR_VERTICAL_TAB ||
  (code >= CHAR_SHIFT_OUT && code <= CHAR_UNIT_SEPARATOR) ||
  code === CHAR_DELETE;

/**
 * {@link https://drafts.csswg.org/css-syntax/#name-start-code-point}
 */
const isNameStart: Predicate<number> = (code) =>
  isLetter(code) || isNonAscii(code) || code === CHAR_UNDERSCORE;

/**
 * {@link https://drafts.csswg.org/css-syntax/#name-code-point}
 */
const isName: Predicate<number> = (code) =>
  isNameStart(code) || isDigit(code) || code === CHAR_MINUS;

/**
 * {@link https://infra.spec.whatwg.org/#surrogate}
 */
const isSurrogate: Predicate<number> = (code) =>
  code >= CHAR_SURROGATE_MIN && code <= CHAR_SURROGATE_MAX;

/**
 * {@link https://drafts.csswg.org/css-syntax/#starts-with-a-valid-escape}
 */
const startsValidEscape: Predicate<[string, number]> = ([input, i]) =>
  input.charCodeAt(i) === CHAR_BACKSLASH && !isNewline(input.charCodeAt(i + 1));

/**
 * {@link https://drafts.csswg.org/css-syntax/#starts-with-a-number}
 */
const startsNumber: Predicate<[string, number]> = ([input, i]) => {
  const first = input.charCodeAt(i);
  switch (first) {
    case CHAR_PLUS:
    case CHAR_MINUS:
      const second = input.charCodeAt(i + 1);
      if (second === CHAR_DOT) {
        return isDigit(input.charCodeAt(i + 2));
      }
      return isDigit(second);

    case CHAR_DOT:
      return isDigit(input.charCodeAt(i + 1));

    default:
      return isDigit(first);
  }
};

/**
 * {@link https://drafts.csswg.org/css-syntax/#would-start-an-identifier}
 */
const startsIdentifier: Predicate<[string, number]> = ([input, i]) => {
  const first = input.charCodeAt(i);
  switch (first) {
    case CHAR_MINUS: {
      const second = input.charCodeAt(i + 1);
      return (
        isNameStart(second) ||
        second === CHAR_MINUS ||
        startsValidEscape([input, i + 1])
      );
    }

    case CHAR_BACKSLASH:
      return startsValidEscape([input, i]);

    default:
      return isNameStart(first);
  }
};

/**
 * {@link https://drafts.csswg.org/css-syntax/#consume-a-name}
 */
const consumeName: Parser.Infallible<[string, number], string> = ([
  input,
  i,
]) => {
  const start = i;
  const n = input.length;
  let code: number;

  while (i < n && isName(input.charCodeAt(i))) {
    i++;
  }

  if (i >= n || !startsValidEscape([input, i])) {
    return [[input, i], input.slice(start, i)];
  }

  let name = input.slice(start, i);

  while (i < n) {
    if (startsValidEscape([input, i])) {
      [[input, i], code] = consumeEscapedCodePoint([input, i + 1]);
      name += fromCharCode(code);
    } else {
      code = input.charCodeAt(i);
      if (isName(code)) {
        const segmentStart = i;
        i++;
        while (i < n && isName(input.charCodeAt(i))) {
          i++;
        }
        name += input.slice(segmentStart, i);
      } else {
        break;
      }
    }
  }

  return [[input, i], name];
};

/**
 * {@link https://drafts.csswg.org/css-syntax/#consume-an-escaped-code-point}
 */
const consumeEscapedCodePoint: Parser.Infallible<[string, number], number> = ([
  input,
  i,
]) => {
  const byte = input.charCodeAt(i);

  if (isNaN(byte)) {
    return [[input, i], CHAR_REPLACEMENT];
  }

  i++;

  if (isHexDigit(byte)) {
    let code = 0;
    let count = 0;
    const maxCount = 6;

    // Convert first hex digit
    if (isDigit(byte)) {
      code = byte - CHAR_ZERO;
    } else if (isLowercaseLetter(byte)) {
      code = byte - CHAR_LOWER_A + 10;
    } else {
      code = byte - CHAR_UPPER_A + 10;
    }
    count++;

    // Parse up to 5 more hex digits
    for (const limit = i + 5; i < limit; i++) {
      const nextByte = input.charCodeAt(i);
      if (!isHexDigit(nextByte)) {
        break;
      }
      
      let digit: number;
      if (isDigit(nextByte)) {
        digit = nextByte - CHAR_ZERO;
      } else if (isLowercaseLetter(nextByte)) {
        digit = nextByte - CHAR_LOWER_A + 10;
      } else {
        digit = nextByte - CHAR_UPPER_A + 10;
      }
      
      code = CHAR_HEX_BASE * code + digit;
      count++;
    }

    if (isWhitespace(input.charCodeAt(i))) {
      i++;
    }

    if (code === CHAR_NULL || isSurrogate(code) || code > CHAR_MAX_CODEPOINT) {
      return [[input, i], CHAR_REPLACEMENT];
    }

    return [[input, i], code];
  }

  return [[input, i], byte];
};

/**
 * {@link https://drafts.csswg.org/css-syntax/#consume-a-number}
 */
const consumeNumber: Parser.Infallible<[string, number], Token.Number> = ([
  input,
  i,
]) => {
  const start = i;

  let code = input.charCodeAt(i);

  let isSigned = false;
  let isInteger = true;

  if (code === CHAR_PLUS || code === CHAR_MINUS) {
    ++i;
    isSigned = true;
  }

  while (isDigit(input.charCodeAt(i))) {
    ++i;
  }

  if (
    input.charCodeAt(i) === CHAR_DOT &&
    isDigit(input.charCodeAt(i + 1))
  ) {
    i += 2;
    isInteger = false;

    while (isDigit(input.charCodeAt(i))) {
      ++i;
    }
  }

  code = input.charCodeAt(i);
  if (code === CHAR_UPPER_E || code === CHAR_LOWER_E) {
    let offset = 1;

    let next = input.charCodeAt(i + 1);
    if (next === CHAR_PLUS || next === CHAR_MINUS) {
      offset = 2;
    }

    if (isDigit(input.charCodeAt(i + offset))) {
      i += offset + 1;
      isInteger = false;

      while (isDigit(input.charCodeAt(i))) {
        ++i;
      }
    }
  }

  return [
    [input, i],
    Token.number(parseFloat(input.slice(start, i)), isInteger, isSigned),
  ];
};

/**
 * {@link https://drafts.csswg.org/css-syntax/#consume-a-numeric-token}
 */
const consumeNumeric: Parser.Infallible<
  [string, number],
  Token.Number | Token.Dimension | Token.Percentage
> = ([input, i]) => {
  let number: Token.Number;

  [[input, i], number] = consumeNumber([input, i]);

  if (startsIdentifier([input, i])) {
    let name: string;

    [[input, i], name] = consumeName([input, i]);

    return [
      [input, i],
      Token.dimension(number.value, name, number.isInteger, number.isSigned),
    ];
  }

  if (input.charCodeAt(i) === CHAR_PERCENT) {
    return [
      [input, i + 1],
      Token.percentage(number.value / 100, number.isInteger),
    ];
  }

  return [[input, i], number];
};

/**
 * {@link https://drafts.csswg.org/css-syntax/#consume-an-ident-like-token}
 */
const consumeIdentifierLike: Parser.Infallible<
  [string, number],
  Token.Ident | Token.Function | Token.URL | Token.BadURL
> = ([input, i]) => {
  let string: string;

  [[input, i], string] = consumeName([input, i]);

  const code = input.charCodeAt(i);

  if (code === CHAR_OPEN_PAREN && string.length === 3) {
    const first = string.charCodeAt(0);
    const second = string.charCodeAt(1);
    const third = string.charCodeAt(2);

    if (
      (first === CHAR_LOWER_U || first === CHAR_UPPER_U) &&
      (second === CHAR_LOWER_R || second === CHAR_UPPER_R) &&
      (third === CHAR_LOWER_L || third === CHAR_UPPER_L)
    ) {
      i++;

      // Skip consecutive whitespace
      while (
        isWhitespace(input.charCodeAt(i)) &&
        isWhitespace(input.charCodeAt(i + 1))
      ) {
        i++;
      }

      let next = input.charCodeAt(i);
      const nextNext = input.charCodeAt(i + 1);

      if (
        next === CHAR_DOUBLE_QUOTE ||
        next === CHAR_SINGLE_QUOTE ||
        (isWhitespace(next) &&
          (nextNext === CHAR_DOUBLE_QUOTE || nextNext === CHAR_SINGLE_QUOTE))
      ) {
        return [[input, i], Token.func(string)];
      }

      return consumeURL([input, i]);
    }
  }

  if (code === CHAR_OPEN_PAREN) {
    return [[input, i + 1], Token.func(string)];
  }

  return [[input, i], Token.ident(string)];
};

/**
 * {@link https://drafts.csswg.org/css-syntax/#consume-a-string-token}
 */
const consumeString: Parser.Infallible<[string, number], Token.String> = ([
  input,
  i,
]) => {
  const end = input.charCodeAt(i++);
  const start = i;
  const n = input.length;
  let code: number;

  // Fast path: find end of string without escapes
  while (i < n) {
    code = input.charCodeAt(i);
    if (isNewline(code) || code === end) {
      break;
    }
    i++;
  }

  // Skip the closing quote if present
  if (i < n && input.charCodeAt(i) === end) {
    i++;
  }

  return [[input, i], Token.string(input.slice(start, i - 1))];
};

/**
 * {@link https://drafts.csswg.org/css-syntax/#consume-a-url-token}
 */
const consumeURL: Parser.Infallible<
  [string, number],
  Token.URL | Token.BadURL
> = ([input, i]) => {
  const n = input.length;
  
  while (isWhitespace(input.charCodeAt(i))) {
    i++;
  }

  let value = "";
  let segmentStart = i;
  let code: number;

  while (i < n) {
    code = input.charCodeAt(i);

    if (code === CHAR_CLOSE_PAREN) {
      value += input.slice(segmentStart, i);
      i++;
      break;
    }

    if (isWhitespace(code)) {
      value += input.slice(segmentStart, i);
      
      while (isWhitespace(input.charCodeAt(i))) {
        i++;
      }

      if (input.charCodeAt(i) === CHAR_CLOSE_PAREN) {
        i++;
        break;
      } else {
        return consumeBadURL([input, i]);
      }
    }

    if (
      code === CHAR_DOUBLE_QUOTE ||
      code === CHAR_SINGLE_QUOTE ||
      code === CHAR_OPEN_PAREN ||
      isNonPrintable(code)
    ) {
      return consumeBadURL([input, i + 1]);
    }

    if (code === CHAR_BACKSLASH) {
      if (startsValidEscape([input, i])) {
        value += input.slice(segmentStart, i);
        [[input, i], code] = consumeEscapedCodePoint([input, i + 1]);
        value += fromCharCode(code);
        segmentStart = i;
        continue;
      } else {
        return consumeBadURL([input, i]);
      }
    }

    i++;
  }

  return [[input, i], Token.url(value)];
};

/**
 * {@link https://drafts.csswg.org/css-syntax/#consume-remnants-of-bad-url}
 */
const consumeBadURL: Parser.Infallible<[string, number], Token.BadURL> = ([
  input,
  i,
]) => {
  let code: number;

  while (i < input.length) {
    if (startsValidEscape([input, i])) {
      [[input, i]] = consumeEscapedCodePoint([input, i]);
    } else {
      code = input.charCodeAt(i++);

      if (code === CHAR_CLOSE_PAREN) {
        break;
      }
    }
  }

  return [[input, i], Token.badURL()];
};

/**
 * {@link https://drafts.csswg.org/css-syntax/#consume-a-token}
 */
const consumeToken: Parser.Infallible<[string, number], Token | null> = ([
  input,
  i,
]) => {
  const n = input.length;
  
  // https://drafts.csswg.org/css-syntax/#consume-comments
  while (i < n) {
    const first = input.charCodeAt(i);
    if (first === CHAR_SLASH && input.charCodeAt(i + 1) === CHAR_ASTERISK) {
      i += 2;

      while (i < n) {
        if (input.charCodeAt(i) === CHAR_ASTERISK && input.charCodeAt(i + 1) === CHAR_SLASH) {
          i += 2;
          break;
        }

        i++;
      }
    } else {
      break;
    }
  }

  if (i >= n) {
    return [[input, i], null];
  }

  const code = input.charCodeAt(i);

  // Fast path for common single-character tokens
  // Process most frequent tokens first to minimize comparisons
  switch (code) {
    case CHAR_SPACE:
    case CHAR_TAB:
    case CHAR_NEWLINE:
      i++;
      while (isWhitespace(input.charCodeAt(i))) {
        i++;
      }
      return [[input, i], Token.whitespace()];

    case CHAR_OPEN_PAREN:
      return [[input, i + 1], Token.openParenthesis()];

    case CHAR_CLOSE_PAREN:
      return [[input, i + 1], Token.closeParenthesis()];

    case CHAR_COMMA:
      return [[input, i + 1], Token.comma()];

    case CHAR_COLON:
      return [[input, i + 1], Token.colon()];

    case CHAR_SEMICOLON:
      return [[input, i + 1], Token.semicolon()];

    case CHAR_OPEN_BRACKET:
      return [[input, i + 1], Token.openSquareBracket()];

    case CHAR_CLOSE_BRACKET:
      return [[input, i + 1], Token.closeSquareBracket()];

    case CHAR_OPEN_BRACE:
      return [[input, i + 1], Token.openCurlyBracket()];

    case CHAR_CLOSE_BRACE:
      return [[input, i + 1], Token.closeCurlyBracket()];

    case CHAR_DOUBLE_QUOTE:
    case CHAR_SINGLE_QUOTE:
      return consumeString([input, i]);

    case CHAR_HASH:
      i++;
      const nextCode = input.charCodeAt(i);
      if (isName(nextCode) || startsValidEscape([input, i])) {
        const isIdentifier = startsIdentifier([input, i]);
        let name: string;
        [[input, i], name] = consumeName([input, i]);
        return [[input, i], Token.hash(name, isIdentifier)];
      }
      return [[input, i], Token.delim(code)];

    case CHAR_PLUS:
      if (startsNumber([input, i])) {
        return consumeNumeric([input, i]);
      }
      return [[input, i + 1], Token.delim(code)];

    case CHAR_MINUS:
      if (startsNumber([input, i])) {
        return consumeNumeric([input, i]);
      }
      const next1 = input.charCodeAt(i + 1);
      if (next1 === CHAR_MINUS && input.charCodeAt(i + 2) === CHAR_GREATER_THAN) {
        return [[input, i + 3], Token.closeComment()];
      }
      if (startsIdentifier([input, i])) {
        return consumeIdentifierLike([input, i]);
      }
      return [[input, i + 1], Token.delim(code)];

    case CHAR_DOT:
      if (startsNumber([input, i])) {
        return consumeNumeric([input, i]);
      }
      return [[input, i + 1], Token.delim(code)];

    case CHAR_LESS_THAN:
      if (
        input.charCodeAt(i + 1) === CHAR_EXCLAMATION &&
        input.charCodeAt(i + 2) === CHAR_MINUS &&
        input.charCodeAt(i + 3) === CHAR_MINUS
      ) {
        return [[input, i + 4], Token.openComment()];
      }
      return [[input, i + 1], Token.delim(code)];

    case CHAR_AT:
      i++;
      if (startsIdentifier([input, i])) {
        let name: string;
        [[input, i], name] = consumeName([input, i]);
        return [[input, i], Token.atKeyword(name)];
      }
      return [[input, i], Token.delim(code)];

    case CHAR_BACKSLASH:
      if (startsValidEscape([input, i])) {
        return consumeIdentifierLike([input, i]);
      }
      return [[input, i + 1], Token.delim(code)];
  }

  // Handle digits
  if (isDigit(code)) {
    return consumeNumeric([input, i]);
  }

  // Handle name-start characters
  if (isNameStart(code)) {
    return consumeIdentifierLike([input, i]);
  }

  return [[input, i + 1], Token.delim(code)];
};
