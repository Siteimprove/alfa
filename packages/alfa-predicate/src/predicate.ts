import { Equality } from "@siteimprove/alfa-equality";
import { Mapper } from "@siteimprove/alfa-mapper";

export type Predicate<
  T,
  U extends T = T,
  A extends Array<unknown> = Array<unknown>
> =
  | ((value: T, ...args: A) => boolean)
  | ((value: T, ...args: A) => value is U);

export namespace Predicate {
  export function test<T, U extends T>(
    predicate: Predicate<T, U>,
    value: T
  ): value is U {
    return predicate(value);
  }

  export function fold<T, U extends T, V>(
    predicate: Predicate<T, U>,
    value: T,
    ifTrue: Mapper<U, V>,
    ifFalse: Mapper<T, V>
  ): V {
    return is<T, U>(value, predicate(value)) ? ifTrue(value) : ifFalse(value);
  }

  export function not<T, U extends T>(
    predicate: Predicate<T, U>
  ): Predicate<T> {
    return value => fold(predicate, value, contradiction, tautology);
  }

  export function and<T, U extends T, V extends U>(
    left: Predicate<T, U>,
    right: Predicate<U, V>
  ): Predicate<T, V> {
    return value => fold(left, value, right, contradiction);
  }

  export function or<T, U extends T, V extends T>(
    left: Predicate<T, U>,
    right: Predicate<T, V>
  ): Predicate<T, U | V> {
    return value => fold(left, value, tautology, right);
  }

  export function xor<T, U extends T, V extends T>(
    left: Predicate<T, U>,
    right: Predicate<T, V>
  ): Predicate<T, U | V> {
    return and(or(left, right), not(and(left, right)));
  }

  export function nor<T, U extends T, V extends T>(
    left: Predicate<T, U>,
    right: Predicate<T, V>
  ): Predicate<T> {
    return not(or(left, right));
  }

  export function nand<T, U extends T, V extends U>(
    left: Predicate<T, U>,
    right: Predicate<T, V>
  ): Predicate<T> {
    return not(and(left, right));
  }

  export function equals<T>(...values: Array<T>): Predicate<unknown, T> {
    return other => values.some(value => Equality.equals(other, value));
  }
}

function is<T, U extends T>(value: T, ok: boolean): value is U {
  return ok;
}

function tautology(): true {
  return true;
}

function contradiction(): false {
  return false;
}
