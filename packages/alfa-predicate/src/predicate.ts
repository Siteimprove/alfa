import { Equatable } from "@siteimprove/alfa-equatable";
import { Mapper } from "@siteimprove/alfa-mapper";

export type Predicate<T, A extends Array<unknown> = []> = (
  value: T,
  ...args: A
) => boolean;

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
    predicate: Predicate<T, A>
  ): Predicate<T, A> {
    return (value, ...args) => !predicate(value, ...args);
  }

  export function and<T, A extends Array<unknown> = []>(
    ...predicates: [Predicate<T, A>, Predicate<T, A>, ...Array<Predicate<T, A>>]
  ): Predicate<T, A> {
    return (value, ...args) =>
      predicates.reduce<boolean>(
        (holds, predicate) => holds && predicate(value, ...args),
        true
      );
  }

  export function or<T, A extends Array<unknown> = []>(
    ...predicates: [Predicate<T, A>, Predicate<T, A>, ...Array<Predicate<T, A>>]
  ): Predicate<T, A> {
    return (value, ...args) =>
      predicates.reduce<boolean>(
        (holds, predicate) => holds || predicate(value, ...args),
        false
      );
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

  export function property<
    T,
    K extends keyof T = keyof T,
    A extends Array<unknown> = []
  >(property: K, predicate: Predicate<T[K], A>): Predicate<T, A> {
    return (value, ...args) => predicate(value[property], ...args);
  }

  export function equals<T>(...values: Array<T>): Predicate<T> {
    return (other) => values.some((value) => Equatable.equals(other, value));
  }
}
