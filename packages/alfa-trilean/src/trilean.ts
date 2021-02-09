import { Mapper } from "@siteimprove/alfa-mapper";
import { Iterable } from "@siteimprove/alfa-iterable";

/**
 * @see https://en.wikipedia.org/wiki/Three-valued_logic
 */
export type Trilean = boolean | undefined;

export namespace Trilean {
  export type Predicate<T, A extends Array<unknown> = []> = (
    value: T,
    ...args: A
  ) => Trilean;

  export function test<T, A extends Array<unknown> = []>(
    predicate: Predicate<T, A>,
    value: T,
    ...args: A
  ): Trilean {
    return predicate(value, ...args);
  }

  export function fold<T, A extends Array<unknown> = [], V = T, W = T, X = T>(
    predicate: Predicate<T, A>,
    ifTrue: Mapper<T, V>,
    ifFalse: Mapper<T, W>,
    ifUndefined: Mapper<T, X>,
    value: T,
    ...args: A
  ): V | W | X {
    switch (predicate(value, ...args)) {
      case true:
        return ifTrue(value);

      case false:
        return ifFalse(value);

      case undefined:
        return ifUndefined(value);
    }
  }

  export function not<T, A extends Array<unknown> = []>(
    predicate: Predicate<T, A>
  ): Predicate<T, A> {
    return (value, ...args) => {
      switch (predicate(value, ...args)) {
        case true:
          return false;

        case false:
          return true;

        case undefined:
          return undefined;
      }
    };
  }

  export function and<T, A extends Array<unknown> = []>(
    ...predicates: [Predicate<T, A>, Predicate<T, A>, ...Array<Predicate<T, A>>]
  ): Predicate<T, A> {
    return (value, ...args) =>
      predicates.reduce<Trilean>((holds, predicate) => {
        if (holds === false) {
          return false;
        }

        if (holds === true) {
          return predicate(value, ...args);
        }

        if (predicate(value, ...args) === false) {
          return false;
        } else {
          return undefined;
        }
      }, true);
  }

  export function or<T, A extends Array<unknown> = []>(
    ...predicates: [Predicate<T, A>, Predicate<T, A>, ...Array<Predicate<T, A>>]
  ): Predicate<T, A> {
    return (value, ...args) =>
      predicates.reduce<Trilean>((holds, predicate) => {
        if (holds === true) {
          return true;
        }

        if (holds === false) {
          return predicate(value, ...args);
        }

        if (predicate(value, ...args) === true) {
          return true;
        } else {
          return undefined;
        }
      }, false);
  }

  export function xor<T, A extends Array<unknown> = []>(
    left: Predicate<T, A>,
    right: Predicate<T, A>
  ): Predicate<T, A> {
    return and(or(left, right), not(and(left, right)));
  }

  export function nor<T, A extends Array<unknown> = []>(
    left: Predicate<T, A>,
    right: Predicate<T, A>
  ): Predicate<T, A> {
    return not(or(left, right));
  }

  export function nand<T, A extends Array<unknown> = []>(
    left: Predicate<T, A>,
    right: Predicate<T, A>
  ): Predicate<T, A> {
    return not(and(left, right));
  }

  export function some<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [number]>
  ): Trilean {
    return Iterable.reduce<T, Trilean>(
      iterable,
      (result, value, i) =>
        test(
          or<T, [number]>(() => result, predicate),
          value,
          i
        ),
      false
    );
  }

  export function none<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [number]>
  ): Trilean {
    return every(iterable, not(predicate));
  }

  export function every<T>(
    iterable: Iterable<T>,
    predicate: Predicate<T, [number]>
  ): Trilean {
    return Iterable.reduce<T, Trilean>(
      iterable,
      (result, value, i) =>
        test(
          and<T, [number]>(() => result, predicate),
          value,
          i
        ),
      true
    );
  }
}
