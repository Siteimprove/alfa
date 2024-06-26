import type { Callback } from "@siteimprove/alfa-callback";
import { Equatable } from "@siteimprove/alfa-equatable";
import type { Mapper } from "@siteimprove/alfa-mapper";

/**
 * @public
 */
export type Predicate<T, A extends Array<unknown> = []> = (
  value: T,
  ...args: A
) => boolean;

/**
 * @public
 */
export namespace Predicate {
  export function test<T, A extends Array<unknown> = []>(
    predicate: Predicate<T, A>,
    value: T,
    ...args: A
  ): boolean {
    return predicate(value, ...args);
  }

  export function fold<T, A extends Array<unknown> = [], V = T, W = T>(
    predicate: Predicate<T, A>,
    ifTrue: Mapper<T, V>,
    ifFalse: Mapper<T, W>,
    value: T,
    ...args: A
  ): V | W {
    return predicate(value, ...args) ? ifTrue(value) : ifFalse(value);
  }

  export function not<T, A extends Array<unknown> = []>(
    predicate: Predicate<T, A>,
  ): Predicate<T, A> {
    return (value, ...args) => !predicate(value, ...args);
  }

  export function and<T, A extends Array<unknown> = []>(
    ...predicates: Array<Predicate<T, A>>
  ): Predicate<T, A> {
    return (value, ...args) => {
      for (let i = 0, n = predicates.length; i < n; i++) {
        if (!predicates[i](value, ...args)) {
          return false;
        }
      }

      return true;
    };
  }

  export function or<T, A extends Array<unknown> = []>(
    ...predicates: Array<Predicate<T, A>>
  ): Predicate<T, A> {
    return (value, ...args) => {
      for (let i = 0, n = predicates.length; i < n; i++) {
        if (predicates[i](value, ...args)) {
          return true;
        }
      }

      return false;
    };
  }

  export function xor<T, A extends Array<unknown> = []>(
    ...predicates: Array<Predicate<T, A>>
  ): Predicate<T, A> {
    return and(or(...predicates), not(and(...predicates)));
  }

  export function nor<T, A extends Array<unknown> = []>(
    ...predicates: Array<Predicate<T, A>>
  ): Predicate<T, A> {
    return not(or(...predicates));
  }

  export function nand<T, A extends Array<unknown> = []>(
    ...predicates: Array<Predicate<T, A>>
  ): Predicate<T, A> {
    return not(and(...predicates));
  }

  export function equals<T>(...values: Array<T>): Predicate<unknown> {
    return (other) => values.some((value) => Equatable.equals(other, value));
  }

  export function property<
    T,
    K extends keyof T = keyof T,
    A extends Array<unknown> = [],
  >(property: K, predicate: Predicate<T[K], A>): Predicate<T, A> {
    return (value, ...args) => predicate(value[property], ...args);
  }

  export function tee<T, A extends Array<unknown> = []>(
    predicate: Predicate<T, A>,
    callback: Callback<T, void, [result: boolean, ...args: A]>,
  ): Predicate<T, A> {
    return (value, ...args) => {
      const result = predicate(value, ...args);

      callback(value, result, ...args);

      return result;
    };
  }
}
