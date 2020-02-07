import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Ok, Result } from "@siteimprove/alfa-result";

export type Parser<I, T, E = never> = (input: I) => Result<readonly [I, T], E>;

export namespace Parser {
  export function map<I, T, U, E>(
    parser: Parser<I, T, E>,
    mapper: Mapper<T, U>
  ): Parser<I, U, E> {
    return input =>
      parser(input).flatMap(([remainder, value]) =>
        Ok.of([remainder, mapper(value)] as const)
      );
  }

  export function flatMap<I, T, U, E>(
    parser: Parser<I, T, E>,
    mapper: Mapper<T, Parser<I, U, E>>
  ): Parser<I, U, E> {
    return input =>
      parser(input).flatMap(([remainder, value]) => mapper(value)(remainder));
  }

  export function zeroOrMore<I, T, E>(
    parser: Parser<I, T, E>
  ): Parser<I, Iterable<T>, E> {
    return input => {
      const values: Array<T> = [];

      while (true) {
        const result = parser(input);

        if (result.isOk()) {
          const [remainder, value] = result.get();

          values.push(value);
          input = remainder;
        } else {
          break;
        }
      }

      return Ok.of([input, values] as const);
    };
  }

  export function oneOrMore<I, T, E>(
    parser: Parser<I, T, E>
  ): Parser<I, Iterable<T>, E> {
    return flatMap(parser, head =>
      map(zeroOrMore(parser), tail => [head, ...tail])
    );
  }

  export function take<I, T, E>(
    parser: Parser<I, T, E>,
    n: number
  ): Parser<I, Iterable<T>, E> {
    return input => {
      const values: Array<T> = [];

      for (let i = 0; i < n; i++) {
        const result = parser(input);

        if (result.isOk()) {
          const [remainder, value] = result.get();

          values.push(value);
          input = remainder;
        } else if (result.isErr()) {
          return result;
        }
      }

      return Ok.of([input, None] as const);
    };
  }

  export function option<I, T, E>(
    parser: Parser<I, T, E>
  ): Parser<I, Option<T>, E> {
    return input => {
      const result = parser(input);

      if (result.isOk()) {
        return result.map(
          ([remainder, value]) => [remainder, Option.of(value)] as const
        );
      }

      return Ok.of([input, None] as const);
    };
  }

  export function either<I, T, U, E>(
    left: Parser<I, T, E>,
    right: Parser<I, U, E>
  ): Parser<I, T | U, E> {
    return input => {
      const result = left(input);

      if (result.isOk()) {
        return result;
      }

      return right(input);
    };
  }

  export function pair<I, T, U, E>(
    left: Parser<I, T, E>,
    right: Parser<I, U, E>
  ): Parser<I, [T, U], E> {
    return flatMap(left, left => map(right, right => [left, right]));
  }

  export function left<I, T, U, E>(
    left: Parser<I, T, E>,
    right: Parser<I, U, E>
  ): Parser<I, T, E> {
    return flatMap(left, left => map(right, () => left));
  }

  export function right<I, T, U, E>(
    left: Parser<I, T, E>,
    right: Parser<I, U, E>
  ): Parser<I, U, E> {
    return flatMap(left, () => map(right, right => right));
  }

  export function delimited<I, T, E>(
    left: Parser<I, unknown, E>,
    separator: Parser<I, T, E>,
    right: Parser<I, unknown, E> = left
  ): Parser<I, T, E> {
    return flatMap(left, () =>
      flatMap(separator, separator => map(right, () => separator))
    );
  }

  export function separated<I, T, U, E>(
    left: Parser<I, T, E>,
    separator: Parser<I, unknown, E>,
    right: Parser<I, U, E>
  ): Parser<I, [T, U], E> {
    return flatMap(left, left =>
      flatMap(separator, () => map(right, right => [left, right]))
    );
  }

  export function separatedList<I, T, E>(
    parser: Parser<I, T, E>,
    separator: Parser<I, unknown, E>
  ): Parser<I, Iterable<T>, E> {
    return input => {
      const values: Array<T> = [];

      const result = parser(input);

      if (result.isErr()) {
        return result;
      }

      const [remainder, value] = result.get();

      values.push(value);
      input = remainder;

      while (true) {
        const result = separator(input);

        if (result.isErr()) {
          return Ok.of([input, values] as const);
        }

        [input] = result.get();

        {
          const result = parser(input);

          if (result.isErr()) {
            return result;
          }

          const [remainder, value] = result.get();

          values.push(value);
          input = remainder;
        }
      }
    };
  }
}
