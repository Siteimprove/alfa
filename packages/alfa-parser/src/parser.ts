import { Array } from "@siteimprove/alfa-array";
import type { Callback } from "@siteimprove/alfa-callback";
import type { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import type { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

const { not } = Predicate;

/**
 * @public
 */
export type Parser<I, T, E = never, A extends Array<unknown> = []> = (
  input: I,
  ...args: A
) => Result<[I, T], E>;

/**
 * @public
 */
export namespace Parser {
  export type Infallible<I, T, A extends Array<unknown> = []> = (
    input: I,
    ...args: A
  ) => [I, T];

  export function toParser<I, T, A extends Array<unknown> = []>(
    infallible: Parser.Infallible<I, T, A>,
  ): Parser<I, T, never, A> {
    return (input, ...args) => Result.of(infallible(input, ...args));
  }

  export function map<I, T, U, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
    mapper: Mapper<T, U>,
  ): Parser<I, U, E, A> {
    return (input, ...args) =>
      parser(input, ...args).map(([remainder, value]) => [
        remainder,
        mapper(value),
      ]);
  }

  export function mapResult<I, T, U, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
    mapper: Mapper<T, Result<U, E>>,
  ): Parser<I, U, E, A> {
    return (input, ...args) =>
      parser(input, ...args).flatMap(([remainder, value]) =>
        mapper(value).map((result) => [remainder, result]),
      );
  }

  export function flatMap<I, T, U, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
    mapper: Mapper<T, Parser<I, U, E, A>>,
  ): Parser<I, U, E, A> {
    return (input, ...args) =>
      parser(input, ...args).flatMap(([remainder, value]) =>
        mapper(value)(remainder, ...args),
      );
  }

  export function filter<I, T, U extends T, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
    refinement: Refinement<T, U>,
    ifError: Mapper<T, E>,
  ): Parser<I, U, E, A>;

  export function filter<I, T, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
    predicate: Predicate<T>,
    ifError: Mapper<T, E>,
  ): Parser<I, T, E, A>;

  export function filter<I, T, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
    predicate: Predicate<T>,
    ifError: Mapper<T, E>,
  ): Parser<I, T, E, A> {
    return mapResult(parser, (value) =>
      predicate(value) ? Result.of(value) : Err.of(ifError(value)),
    );
  }

  export function reject<I, T, U extends T, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
    refinement: Refinement<T, U>,
    ifError: Mapper<T, E>,
  ): Parser<I, Exclude<T, U>, E, A>;

  export function reject<I, T, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
    predicate: Predicate<T>,
    ifError: Mapper<T, E>,
  ): Parser<I, T, E, A>;

  export function reject<I, T, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
    predicate: Predicate<T>,
    ifError: Mapper<T, E>,
  ): Parser<I, T, E, A> {
    return filter(parser, not(predicate), ifError);
  }

  export function zeroOrMore<I, T, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
  ): Parser<I, Array<T>, E, A> {
    return takeAtLeast(parser, 0);
  }

  export function oneOrMore<I, T, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
  ): Parser<I, [T, ...Array<T>], E, A> {
    // The result contains at least one token, so this cast is safe
    return takeAtLeast(parser, 1) as Parser<I, [T, ...Array<T>], E, A>;
  }

  export function take<I, T, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
    count: number,
  ): Parser<I, Array<T>, E, A> {
    return takeBetween(parser, count, count);
  }

  export function takeBetween<I, T, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
    lower: number,
    upper: number,
  ): Parser<I, Array<T>, E, A> {
    return (input, ...args) => {
      const values: Array<T> = [];

      let value: T;

      for (let i = 0; i < upper; i++) {
        const result = parser(input, ...args);

        if (result.isOk()) {
          [input, value] = result.get();
          values.push(value);
        } else if (result.isErr()) {
          if (values.length < lower) {
            return result;
          } else {
            break;
          }
        }
      }

      return Result.of([input, values]);
    };
  }

  export function takeAtLeast<I, T, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
    lower: number,
  ): Parser<I, Array<T>, E, A> {
    return takeBetween(parser, lower, Infinity);
  }

  export function takeAtMost<I, T, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
    upper: number,
  ): Parser<I, Array<T>, E, A> {
    return takeBetween(parser, 0, upper);
  }

  export function takeUntil<I, T, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
    condition: Parser<I, unknown, E, A>,
  ): Parser<I, Array<T>, E, A> {
    return (input, ...args) => {
      const values: Array<T> = [];

      let value: T;

      while (true) {
        if (condition(input, ...args).isOk()) {
          return Result.of([input, values]);
        }

        const result = parser(input, ...args);

        if (result.isOk()) {
          [input, value] = result.get();
          values.push(value);
        } else if (result.isErr()) {
          return result;
        }
      }
    };
  }

  export function peek<I, T, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
  ): Parser<I, T, E, A> {
    return (input, ...args) =>
      parser(input, ...args).map(([, value]) => [input, value]);
  }

  export function tee<I, T, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
    callback: Callback<T, void, [remainder: I, ...args: A]>,
  ): Parser<I, T, E, A> {
    return (input, ...args) =>
      parser(input, ...args).tee(([remainder, result]) => {
        callback(result, remainder, ...args);
      });
  }

  export function teeErr<I, T, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
    callback: Callback<E, void, A>,
  ): Parser<I, T, E, A> {
    return (input, ...args) =>
      parser(input, ...args).teeErr((err) => {
        callback(err, ...args);
      });
  }

  export function option<I, T, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
  ): Parser<I, Option<T>, E, A> {
    return (input, ...args) => {
      const result = parser(input, ...args);

      if (result.isOk()) {
        const [input, value] = result.get();

        return Result.of([input, Option.of(value)]);
      }

      return Result.of([input, None]);
    };
  }

  export function either<I, T, U, E, A extends Array<unknown> = []>(
    left: Parser<I, T, E, A>,
    right: Parser<I, U, E, A>,
  ): Parser<I, T | U, E, A>;

  export function either<I, T, E, A extends Array<unknown> = []>(
    left: Parser<I, T, E, A>,
    right: Parser<I, T, E, A>,
    ...rest: Array<Parser<I, T, E, A>>
  ): Parser<I, T, E, A>;

  export function either<I, T, E, A extends Array<unknown> = []>(
    ...parsers: Array<Parser<I, T, E, A>>
  ): Parser<I, T, E, A> {
    return (input, ...args) => {
      let error: Err<E>;

      for (const parser of parsers) {
        const result = parser(input, ...args);

        if (result.isErr()) {
          error = result;
        } else {
          return result;
        }
      }

      // Per the function overloads, there will always be at least one parser
      // specified. It is therefore safe to assert that if we get this far, at
      // least one parser will have produced an error.
      return error!;
    };
  }

  export function pair<I, T, U, E, A extends Array<unknown> = []>(
    left: Parser<I, T, E, A>,
    right: Parser<I, U, E, A>,
  ): Parser<I, [T, U], E, A> {
    return flatMap(left, (left) => map(right, (right) => [left, right]));
  }

  export function left<I, T, U, E, A extends Array<unknown> = []>(
    left: Parser<I, T, E, A>,
    right: Parser<I, U, E, A>,
  ): Parser<I, T, E, A> {
    return flatMap(left, (left) => map(right, () => left));
  }

  export function right<I, T, U, E, A extends Array<unknown> = []>(
    left: Parser<I, T, E, A>,
    right: Parser<I, U, E, A>,
  ): Parser<I, U, E, A> {
    return flatMap(left, () => map(right, (right) => right));
  }

  export function delimited<I, T, E, A extends Array<unknown> = []>(
    delimiter: Parser<I, unknown, E, A>,
    parser: Parser<I, T, E, A>,
  ): Parser<I, T, E, A>;

  export function delimited<I, T, E, A extends Array<unknown> = []>(
    left: Parser<I, unknown, E, A>,
    parser: Parser<I, T, E, A>,
    right: Parser<I, unknown, E, A>,
  ): Parser<I, T, E, A>;

  export function delimited<I, T, E, A extends Array<unknown> = []>(
    left: Parser<I, unknown, E, A>,
    parser: Parser<I, T, E, A>,
    right: Parser<I, unknown, E, A> = left,
  ): Parser<I, T, E, A> {
    return flatMap(left, () =>
      flatMap(parser, (parser) => map(right, () => parser)),
    );
  }

  export function separated<I, T, U, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
    separator: Parser<I, unknown, E, A>,
  ): Parser<I, [T, T], E, A>;

  export function separated<I, T, U, E, A extends Array<unknown> = []>(
    left: Parser<I, T, E, A>,
    separator: Parser<I, unknown, E, A>,
    right: Parser<I, U, E, A>,
  ): Parser<I, [T, U], E, A>;

  export function separated<I, T, E, A extends Array<unknown> = []>(
    left: Parser<I, T, E, A>,
    separator: Parser<I, unknown, E, A>,
    right: Parser<I, T, E, A> = left,
  ): Parser<I, [T, T], E, A> {
    return flatMap(left, (left) =>
      flatMap(separator, () => map(right, (right) => [left, right])),
    );
  }

  /**
   * Parse a separated list containing at least one item
   *
   * @param parser - Parser for the items in the list
   * @param separator - Parser for the separator between items
   * @param lower - Minimum number of items to parse, defaults to 1
   * @param upper - Maximum number of items to parse, defaults to Infinity
   */
  export function separatedList<I, T, E, A extends Array<unknown> = []>(
    parser: Parser<I, T, E, A>,
    separator: Parser<I, unknown, E, A>,
    lower: number = 1,
    upper: number = Infinity,
  ): Parser<I, [T, ...Array<T>], E, A> {
    return map(
      pair(
        parser,
        takeBetween(
          right(separator, parser),
          Math.max(0, lower - 1),
          Math.min(Infinity, upper - 1),
        ),
      ),
      ([first, rest]) => Array.prepend(rest, first),
    );
  }

  /**
   * Parse if the result satisfies the predicate or refinement.
   */
  export function parseIf<
    I,
    T,
    E,
    U extends T = T,
    A extends Array<unknown> = [],
  >(
    refinement: Refinement<T, U>,
    parser: Parser<I, T, E, A>,
    ifError: Mapper<T, E>,
  ): Parser<I, U, E, A>;

  export function parseIf<I, T, E, A extends Array<unknown> = []>(
    predicate: Predicate<T>,
    parser: Parser<I, T, E, A>,
    ifError: Mapper<T, E>,
  ): Parser<I, T, E, A>;

  export function parseIf<
    I,
    T,
    E,
    U extends T = T,
    A extends Array<unknown> = [],
  >(
    refinement: Refinement<T, U> | Predicate<T>,
    parser: Parser<I, T, E, A>,
    ifError: Mapper<T, E>,
  ): Parser<I, U, E, A> | Parser<I, T, E, A> {
    return (input, ...args) =>
      parser(input, ...args).flatMap(([rest, result]) =>
        refinement(result)
          ? Ok.of<[I, T]>([rest, result])
          : Err.of(ifError(result)),
      );
  }

  export function end<I extends Iterable<unknown>, E>(
    ifError: Mapper<I extends Iterable<infer T> ? T : unknown, E>,
  ): Parser<I, void, E> {
    return (input) => {
      for (const value of input) {
        return Err.of(ifError(value as any));
      }

      return Result.of([input, undefined]);
    };
  }

  /**
   * @deprecated Use `end()`
   */
  export const eof = end;
}
