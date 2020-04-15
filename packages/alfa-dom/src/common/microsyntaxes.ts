import { Map } from "@siteimprove/alfa-map";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

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
