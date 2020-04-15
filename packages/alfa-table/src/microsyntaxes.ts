import { Err, Ok, Result } from "@siteimprove/alfa-result";

/**
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#signed-integers
 */
export function parseInteger(
  str: string
): Result<readonly [string, number], string> {
  // empty/whitespace string are errors for specs, not for Number…
  // \s seems to be close enough to "ASCII whitespace".
  if (str.match(/^\s*$/)) {
    return Outcomes.empty;
  }
  const raw = Number(str);
  return isNaN(raw)
    ? Outcomes.notNumber
    : raw !== Math.floor(raw)
    ? Outcomes.notInteger
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
    value < 0 ? Outcomes.negative : result
  );
}

export namespace Outcomes {
  export const empty = Err.of("The string is empty");
  export const notNumber = Err.of("The string does not represent a number");
  export const notInteger = Err.of("The string does not represent an integer");
  export const negative = Err.of("This is a negative number");
}
