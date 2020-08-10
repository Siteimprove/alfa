import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";

export function any<I, T, E, A extends [] = []>(
  parser: Parser<I, T, E, A>,
  ...rest: Array<Parser<I, T, E, A>>
): Parser<I, Iterable<T>, E, A> {
  const parsers = [parser, ...rest];

  return (input, ...args) => {
    const seen = parsers.map(() => false);
    const values: Array<T> = [];

    outer: while (true) {
      let error: Err<E>;

      for (let i = 0, n = parsers.length; i < n; i++) {
        if (seen[i]) {
          continue;
        }

        const result = parsers[i](input, ...args);

        if (result.isErr()) {
          error = result;
        } else {
          const [remainder, value] = result.get();

          values.push(value);
          input = remainder;
          seen[i] = true;

          continue outer;
        }
      }

      if (values.length === 0) {
        return error!;
      }

      return Result.of([input, values]);
    }
  };
}
