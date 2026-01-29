import { Array } from "@siteimprove/alfa-array";
import type { Callback } from "@siteimprove/alfa-callback";
import type { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import type { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Result } from "@siteimprove/alfa-result";

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

  export function skip<I, E, A extends Array<unknown> = []>(
    parser: Parser<I, unknown, E, A>,
  ): Parser<I, void, E, A> {
    return map(parser, () => undefined);
  }

  export function skipUntil<I, E, A extends Array<unknown> = []>(
    parser: Parser<I, unknown, E, A>,
    delimiter: Parser<I, unknown, E, A>,
  ): Parser<I, void, E, A> {
    return skip(takeUntil(parser, delimiter));
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

  export function left<I, T, E, A extends Array<unknown> = []>(
    left: Parser<I, T, E, A>,
    ...right: Array<Parser<I, unknown, E, A>>
  ): Parser<I, T, E, A> {
    return (input, ...args) => {
      const first = left(input, ...args);

      if (!first.isOk()) {
        return first;
      }

      let [remainder, result] = first.get();

      for (const parser of right) {
        const next = parser(remainder, ...args);

        if (next.isErr()) {
          return next;
        }

        [remainder] = next.getUnsafe();
      }

      return Result.of([remainder, result]);
    };
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
   * Turns `[Parser<A>, Parser<B>, Parser<C>]` into `Parser<[A,  B,  C]>`
   */
  export function array<
    I,
    T extends Array<unknown>,
    E,
    A extends Array<unknown> = [],
  >(
    separator: Parser<I, any, E, A>,
    ...parsers: ToParsers<I, T, E, A>
  ): Parser<I, T, E, A> {
    return (input, ...args) => {
      const result: Array<any> = [];

      for (const parser of parsers) {
        // Skip leading separators
        for (const [remainder] of separator(input, ...args)) {
          input = remainder;
        }

        const parsed = parser(input, ...args);
        if (parsed.isErr()) {
          return parsed;
        }

        const [next, value] = parsed.getUnsafe();
        input = next;
        result.push(value);
      }

      return Result.of([input, result as T]);
    };
  }

  /**
   * {@link https://drafts.csswg.org/css-values-4/#comb-any}
   * Turns `[Parser<A>, Parser<B>, Parser<C>]` into `Parser<A || B || C>`
   *
   * @Remarks
   * This parser never fails and will return an array of `undefined` if none
   * of the individual parsers succeed. It is nonetheless easier to not define
   * it as Infallible since call sites usually expect Parser and combinators.
   *
   * Be careful that no early parser can accept a prefix of what a later one
   * accepts. Otherwise, the early parser will incorrectly consume the tokens
   * of the later one.
   * That is, `doubleBar(parseFoo, parseFoobar)` will happily consume the "foo"
   * in "foobar" and thus incorrectly "fail" on "foobar foo" (`parseFoo` consumes
   * the "foo" in "foobar" leaving "bar foo" that cannot be parsed further).
   */
  export function doubleBar<
    I,
    T extends Array<unknown>,
    E,
    A extends Array<unknown> = [],
  >(
    separator: Parser<I, any, E, A>,
    ...parsers: ToParsers<I, T, E, A>
  ): Parser<I, Maybe<T>, E, A> {
    const size = parsers.length;

    return (input, ...args) => {
      const result: Maybe<T> = globalThis
        .Array(size)
        .map(() => undefined) as Maybe<T>;

      // The main loop goes through the input, testing all parsers until one
      // matches and looping back immediately to parse the next token.
      mainLoop: while (true) {
        // First, skip leading separators
        for (const [remainder] of separator(input, ...args)) {
          input = remainder;
        }

        // Next, test all parsers until a match is found.
        for (let i = 0; i < size; i++) {
          // If this parser already succeeded, move on to the next one
          if (result[i] !== undefined) {
            // This continues the parsers loop, not the main loop.
            continue;
          }

          // Try the parser
          const parsed = parsers[i](input, ...args);
          if (parsed.isOk()) {
            [input, result[i]] = parsed.get();

            // Once a parser succeeds, we want to restart the main loop, so we
            // can again test all parsers in order. We could keep going with
            // the remaining parsers, but then we might need to also test the
            // previous ones, …
            // This is just cleaner logic.
            continue mainLoop;
          }
        }

        // If no parser succeeds (or they all already produced a value), we're
        // done with the input and can finally escape the main loop.
        break;
      }

      return Result.of([input, result]);
    };
  }

  /**
   * Turns `[A, B, C]` into `[Parser<A>, Parser<B>, Parser<C>]`
   */
  type ToParsers<
    I,
    T extends Array<unknown>,
    E,
    A extends Array<unknown> = [],
  > = T extends [infer Head, ...infer Tail]
    ? [Parser<I, Head, E, A>, ...ToParsers<I, Tail, E, A>]
    : [];

  /**
   * Turns `[A, B, C]` into `[A | undefined, B | undefined, C | undefined]`
   */
  type Maybe<T extends Array<unknown>> = T extends [infer Head, ...infer Tail]
    ? [Head | undefined, ...Maybe<Tail>]
    : [];

  export function end<I extends Iterable<unknown>, E>(
    ifError: Mapper<I extends Iterable<infer T> ? T : unknown, E>,
  ): Parser<I, void, E, Array<any>> {
    return (input) => {
      for (const value of input) {
        return Err.of(ifError(value as any));
      }

      return Result.of([input, undefined]);
    };
  }

  export function final<
    I extends Iterable<unknown>,
    T,
    E,
    A extends Array<unknown> = [],
  >(
    parser: Parser<I, T, E, A>,
    ifError: Mapper<I extends Iterable<infer T> ? T : unknown, E>,
  ): Parser<I, T, E, A> {
    return left(parser, end<I, E>(ifError));
  }
}
