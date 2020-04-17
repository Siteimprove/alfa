import { Err, Ok, Result } from "@siteimprove/alfa-result";

/**
 * @see https://infra.spec.whatwg.org/#ascii-digit
 */
type asciiDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

function isAsciiDigit(str: string): str is asciiDigit {
  return (
    str === "0" ||
    str === "1" ||
    str === "2" ||
    str === "3" ||
    str === "4" ||
    str === "5" ||
    str === "6" ||
    str === "7" ||
    str === "8" ||
    str === "9"
  );
}

function digitToNumber(digit: asciiDigit): number {
  switch (digit) {
    case "0":
      return 0;
    case "1":
      return 1;
    case "2":
      return 2;
    case "3":
      return 3;
    case "4":
      return 4;
    case "5":
      return 5;
    case "6":
      return 6;
    case "7":
      return 7;
    case "8":
      return 8;
    case "9":
      return 9;
  }
}

/**
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#signed-integers
 */
export function parseSignedInteger(str: string): Result<number, string> {
  // 1, 4
  const input = str.trim();
  // 2
  let position = 0;
  // 3
  let positive = true;
  // 5
  if (position >= input.length) {
    return Outcomes.notNumber;
  }
  // 6
  switch (input[position]) {
    case "-": // 6a.1
      positive = false;
      // 6a.2
      position++;
      break;
    case "+":
      // 6b.1
      position++;
      break;
  }
  // 6a.3, 6b.2, 7
  if (position >= input.length || !isAsciiDigit(input[position])) {
    return Outcomes.notNumber;
  }
  // 8
  let value = 0;
  for (; position < input.length; position++) {
    const char = input[position];
    if (isAsciiDigit(char)) {
      value = value * 10 + digitToNumber(char);
    } else {
      break;
    }
  }

  return Ok.of(positive ? value : 0-value);
}

/**
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#rules-for-parsing-non-negative-integers
 */
export function parseNonNegativeInteger(str: string): Result<number, string> {
  const result = parseSignedInteger(str);
  return parseSignedInteger(str).andThen((value) =>
    value < 0 ? Outcomes.negative : result
  );
}

export namespace Outcomes {
  export const notNumber = Err.of("The string does not represent a number");
  export const negative = Err.of("This is a negative number");
}
