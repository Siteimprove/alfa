import { Callback } from "@siteimprove/alfa-callback";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Result, Err } from "@siteimprove/alfa-result";
import { Thunk } from "@siteimprove/alfa-thunk";

export type Parser<I, T, E = never, A extends Array<unknown> = []> = (
  input: I,
  ...args: A
) => Result<readonly [I, T], E>;

export namespace Parser {
  export function map<I, T, U, E, A extends Array<unknown>>(
    parser: Parser<I, T, E, A>,
    mapper: Mapper<T, U>
  ): Parser<I, U, E, A> {
    return (input, ...args) =>
      parser(input, ...args).map(
        ([remainder, value]) => [remainder, mapper(value)] as const
      );
  }

  export function flatMap<I, T, U, E, A extends Array<unknown>>(
    parser: Parser<I, T, E, A>,
    mapper: Mapper<T, Parser<I, U, E, A>>
  ): Parser<I, U, E, A> {
    return (input, ...args) =>
      parser(input, ...args).flatMap(([remainder, value]) =>
        mapper(value)(remainder, ...args)
      );
  }

  export function filter<I, T, U extends T, E, A extends Array<unknown>>(
    parser: Parser<I, T, E, A>,
    predicate: Predicate<T, U>,
    ifError: Thunk<E>
  ): Parser<I, U, E, A> {
    return flatMap(parser, (value) => (input, ..._) => {
      const result: Result<readonly [I, U], E> = predicate(value)
        ? Ok.of([input, value] as const)
        : Err.of(ifError());

      return result;
    });
  }

  export function zeroOrMore<I, T, E, A extends Array<unknown>>(
    parser: Parser<I, T, E, A>
  ): Parser<I, Iterable<T>, E, A> {
    return (input, ...args) => {
      const values: Array<T> = [];

      while (true) {
        const result = parser(input, ...args);

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

  export function oneOrMore<I, T, E, A extends Array<unknown>>(
    parser: Parser<I, T, E, A>
  ): Parser<I, Iterable<T>, E, A> {
    return flatMap(parser, (head) =>
      map(zeroOrMore(parser), (tail) => [head, ...tail])
    );
  }

  export function take<I, T, E, A extends Array<unknown>>(
    parser: Parser<I, T, E, A>,
    n: number
  ): Parser<I, Iterable<T>, E, A> {
    return (input, ...args) => {
      const values: Array<T> = [];

      for (let i = 0; i < n; i++) {
        const result = parser(input, ...args);

        if (result.isOk()) {
          const [remainder, value] = result.get();

          values.push(value);
          input = remainder;
        } else if (result.isErr()) {
          return result;
        }
      }

      return Ok.of([input, values] as const);
    };
  }

  export function peek<I, T, E, A extends Array<unknown>>(
    parser: Parser<I, T, E, A>
  ): Parser<I, T, E, A> {
    return (input, ...args) =>
      parser(input, ...args).map(([, value]) => [input, value]);
  }

  export function tee<I, T, E, A extends Array<unknown>>(
    parser: Parser<I, T, E, A>,
    callback: Callback<T>
  ): Parser<I, T, E, A> {
    return map(parser, (value) => {
      callback(value);
      return value;
    });
  }

  export function option<I, T, E, A extends Array<unknown>>(
    parser: Parser<I, T, E, A>
  ): Parser<I, Option<T>, E, A> {
    return (input, ...args) => {
      const result = map(parser, (value) => Option.of(value))(input, ...args);

      if (result.isOk()) {
        return result;
      }

      return Ok.of([input, None] as const);
    };
  }

  /**
   * Tries to parse using left. If it fails, parses using right.
   */
  export function either<I, T, U, E, A extends Array<unknown>>(
    left: Parser<I, T, E, A>,
    right: Parser<I, U, E, A>
  ): Parser<I, T | U, E, A> {
    return (input, ...args) => {
      const result = left(input, ...args);

      if (result.isOk()) {
        return result;
      }

      return right(input, ...args);
    };
  }

  /**
   * Parses left, then right. Returns the pair of results.
   */
  export function pair<I, T, U, E, A extends Array<unknown>>(
    left: Parser<I, T, E, A>,
    right: Parser<I, U, E, A>
  ): Parser<I, [T, U], E, A> {
    return flatMap(left, (left) => map(right, (right) => [left, right]));
  }

  /**
   * Parses left, then right. Only returns left.
   * Useful, e.g. if right is a closing parenthesis.
   */
  export function left<I, T, U, E, A extends Array<unknown>>(
    left: Parser<I, T, E, A>,
    right: Parser<I, U, E, A>
  ): Parser<I, T, E, A> {
    return flatMap(left, (left) => map(right, () => left));
  }

  /**
   * Parses left, then right. Only returns right.
   * Useful, e.g. if left is on opening parenthesis.
   */
  export function right<I, T, U, E, A extends Array<unknown>>(
    left: Parser<I, T, E, A>,
    right: Parser<I, U, E, A>
  ): Parser<I, U, E, A> {
    return flatMap(left, () => map(right, (right) => right));
  }

  /**
   * Parses left, separator, right. Only return separator.
   * Useful, e.g. if left and right are whitespaces (=> parses a spaces delimited word).
   */
  export function delimited<I, T, E, A extends Array<unknown>>(
    left: Parser<I, unknown, E, A>,
    separator: Parser<I, T, E, A>,
    right: Parser<I, unknown, E, A> = left
  ): Parser<I, T, E, A> {
    return flatMap(left, () =>
      flatMap(separator, (separator) => map(right, () => separator))
    );
  }

  /**
   * Parses left, separator, right. Returns the pair left, right.
   */
  export function separated<I, T, U, E, A extends Array<unknown>>(
    left: Parser<I, T, E, A>,
    separator: Parser<I, unknown, E, A>,
    right: Parser<I, U, E, A>
  ): Parser<I, [T, U], E, A> {
    return flatMap(left, (left) =>
      flatMap(separator, () => map(right, (right) => [left, right]))
    );
  }

  export function separatedList<I, T, E, A extends Array<unknown>>(
    parser: Parser<I, T, E, A>,
    separator: Parser<I, unknown, E, A>
  ): Parser<I, Iterable<T>, E, A> {
    return map(
      pair(parser, zeroOrMore(right(separator, parser))),
      ([first, rest]) => [first, ...rest]
    );
  }

  export function eof<I extends Iterable<unknown>, E>(
    ifError: Thunk<E>
  ): Parser<I, void, E> {
    return (input) => {
      for (const _ of input) {
        return Err.of(ifError());
      }

      return Ok.of([input, undefined] as const);
    };
  }
}
