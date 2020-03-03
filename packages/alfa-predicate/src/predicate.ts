import { Equatable } from "@siteimprove/alfa-equatable";
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
  ): value is U;

  export function test<T>(predicate: Predicate<T, T>, value: T): boolean;

  export function test<T, U extends T>(
    predicate: Predicate<T, U>,
    value: T
  ): value is U {
    return predicate(value);
  }

  export function fold<T, U extends T, V, W>(
    predicate: Predicate<T, U>,
    value: T,
    ifTrue: Mapper<U, V>,
    ifFalse: Mapper<T, W>
  ): V | W {
    return predicate(value) ? ifTrue(value) : ifFalse(value);
  }

  export function not<T, U extends T>(
    predicate: Predicate<T, U>
  ): Predicate<T> {
    return function not(value) {
      return fold(predicate, value, contradiction, tautology);
    };
  }

  export function and<T, U extends T, V extends U>(
    left: Predicate<T, U>,
    right: Predicate<U, V>
  ): Predicate<T, V> {
    return function and(value) {
      return fold(left, value, right, contradiction);
    };
  }

  export function or<T, U extends T, V extends T>(
    left: Predicate<T, U>,
    right: Predicate<T, V>
  ): Predicate<T, U | V> {
    return function or(value) {
      return fold(left, value, tautology, right);
    };
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
    return function equals(other) {
      return values.some(value => Equatable.equals(other, value));
    };
  }

  export function property<T, K extends keyof T>(
    property: K,
    predicate: Predicate<T[K]>
  ): Predicate<T> {
    return value => predicate(value[property]);
  }

  export function isString(value: unknown): value is string {
    return typeof value === "string";
  }

  export function isNumber(value: unknown): value is number {
    return typeof value === "number";
  }

  export function isBigInt(value: unknown): value is bigint {
    return typeof value === "bigint";
  }

  export function isBoolean(value: unknown): value is boolean {
    return typeof value === "boolean";
  }

  export function isNull(value: unknown): value is null {
    return value === null;
  }

  export function isUndefined(value: unknown): value is undefined {
    return value === undefined;
  }

  export function isSymbol(value: unknown): value is symbol {
    return typeof value === "symbol";
  }

  export function isFunction(value: unknown): value is Function {
    return typeof value === "function";
  }

  export function isObject(
    value: unknown
  ): value is { [key: string]: unknown } {
    return typeof value === "object" && value !== null;
  }

  export const isPrimitive = or(
    isString,
    or(
      isNumber,
      or(isBigInt, or(isBoolean, or(isNull, or(isUndefined, isSymbol))))
    )
  );
}

function tautology(): true {
  return true;
}

function contradiction(): false {
  return false;
}
