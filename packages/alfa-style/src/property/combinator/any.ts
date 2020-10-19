import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";

/**
 * @see https://drafts.csswg.org/css-values/#comb-any
 */
export function any<I, T, E = never, A extends [] = []>(
  parser: Parser<I, T, E, A>,
  ...rest: Array<Parser<I, T, E, A>>
): Parser<I, Iterable<T>, E, A> {
  const parsers = [parser, ...rest];

  return (input, ...args) => {
    const seen = parsers.map(() => false);
    const values: Array<T> = [];

    let error: Err<E> | undefined;

    for (let i = 0, n = parsers.length; i < n; i++) {
      if (seen[i]) {
        continue;
      }

      const result = parsers[i](input, ...args);

      if (result.isErr()) {
        error = error ?? result;
      } else {
        const [remainder, value] = result.get();

        values.push(value);
        input = remainder;
        seen[i] = true;
        i = -1; // Restart the loop
      }
    }

    if (values.length === 0) {
      return error!;
    }

    return Result.of([input, values]);
  };
}
