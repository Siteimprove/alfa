import { Map } from "@siteimprove/alfa-map";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Parser } from "./parser";

/**
 * Parsing HTML microsyntaxes.
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html
 */

/**
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#signed-integers
 */
export function parseInteger(
  str: string
): Result<readonly [string, number], string> {
  // empty/whitespace string are errors for specs, not for Number…
  // \s seems to be close enough to "ASCII whitespace".
  if (str.match(/^\s*$/)) {
    return Err.of("The string is empty");
  }
  const raw = Number(str);
  return isNaN(raw)
    ? Err.of("The string does not represent a number")
    : raw !== Math.floor(raw)
    ? Err.of("The string does not represent an integer")
    : // 0 and -0 are different (but equal…) floats. Normalising.
      Ok.of(["", raw === -0 ? 0 : raw] as const);
}

/**
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#rules-for-parsing-non-negative-integers
 */
export function parseNonNegativeInteger(
  str: string
): Result<readonly [string, number], string> {
  const result = parseInteger(str);
  return result.andThen(([_, value]) =>
    value < 0 ? Err.of("This is a negative number") : result
  );
}

/**
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#enumerated-attribute
 */
export enum EnumeratedValueError {
  Missing = "missing",
  Invalid = "invalid",
}

export function parseEnumeratedValue<RESULT>(
  mapping: Map<string, RESULT>
): Parser<string, RESULT, EnumeratedValueError> {
  function parser(
    str: string
  ): Result<readonly [string, RESULT], EnumeratedValueError> {
    const result = mapping.get(str.toLowerCase());

    return str === ""
      ? Err.of(EnumeratedValueError.Missing)
      : result.isNone()
      ? Err.of(EnumeratedValueError.Invalid)
      : Ok.of(["", result.get()] as const);
  }

  return parser;
}

/**
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#space-separated-tokens
 */
export function parseTokensList(
  str: string
): Ok<readonly [string, Array<string>]> {
  return Ok.of([
    "",
    str
      .trim()
      .split(/\s+/)
      .filter((s) => s !== ""),
  ] as const);
}
