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
  export function test<
    T,
    U extends T = T,
    A extends Array<unknown> = Array<unknown>
  >(predicate: Predicate<T, U, A>, value: T, ...args: A): value is U;

  export function test<T, A extends Array<unknown> = Array<unknown>>(
    predicate: Predicate<T, T, A>,
    value: T,
    ...args: A
  ): boolean;

  export function test<
    T,
    U extends T = T,
    A extends Array<unknown> = Array<unknown>
  >(predicate: Predicate<T, U, A>, value: T, ...args: A): value is U {
    return predicate(value, ...args);
  }

  export function fold<
    T,
    U extends T = T,
    A extends Array<unknown> = Array<unknown>,
    V = U,
    W = T
  >(
    predicate: Predicate<T, U, A>,
    ifTrue: Mapper<U, V>,
    ifFalse: Mapper<T, W>,
    value: T,
    ...args: A
  ): V | W {
    return predicate(value, ...args) ? ifTrue(value) : ifFalse(value);
  }

  export function not<
    T,
    U extends T = T,
    A extends Array<unknown> = Array<unknown>
  >(predicate: Predicate<T, U, A>): Predicate<T, T, A> {
    return (value, ...args) => !predicate(value, ...args);
  }

  export function and<
    T,
    U extends T = T,
    V extends U = U,
    A extends Array<unknown> = Array<unknown>
  >(left: Predicate<T, U, A>, right: Predicate<U, V, A>): Predicate<T, V, A>;

  export function and<
    T,
    U extends T = T,
    A extends Array<unknown> = Array<unknown>
  >(
    left: Predicate<T, U, A>,
    right: Predicate<T, U, A>,
    ...rest: Array<Predicate<T, U, A>>
  ): Predicate<T, U, A>;

  export function and<
    T,
    U extends T = T,
    A extends Array<unknown> = Array<unknown>
  >(...predicates: Array<Predicate<T, U, A>>): Predicate<T, U, A> {
    return (value, ...args) =>
      predicates.reduce<boolean>(
        (holds, predicate) => holds && predicate(value, ...args),
        true
      );
  }

  export function or<
    T,
    U extends T = T,
    V extends T = T,
    A extends Array<unknown> = Array<unknown>
  >(
    left: Predicate<T, U, A>,
    right: Predicate<T, V, A>
  ): Predicate<T, U | V, A>;

  export function or<
    T,
    U extends T = T,
    A extends Array<unknown> = Array<unknown>
  >(
    left: Predicate<T, U, A>,
    right: Predicate<T, U, A>,
    ...rest: Array<Predicate<T, U, A>>
  ): Predicate<T, U, A>;

  export function or<
    T,
    U extends T = T,
    A extends Array<unknown> = Array<unknown>
  >(...predicates: Array<Predicate<T, U, A>>): Predicate<T, U, A> {
    return (value, ...args) =>
      predicates.reduce<boolean>(
        (holds, predicate) => holds || predicate(value, ...args),
        false
      );
  }

  export function xor<
    T,
    U extends T = T,
    V extends T = T,
    A extends Array<unknown> = Array<unknown>
  >(
    left: Predicate<T, U, A>,
    right: Predicate<T, V, A>
  ): Predicate<T, U | V, A> {
    return and(or(left, right), not(and(left, right)));
  }

  export function nor<
    T,
    U extends T = T,
    V extends T = T,
    A extends Array<unknown> = Array<unknown>
  >(left: Predicate<T, U, A>, right: Predicate<T, V, A>): Predicate<T, T, A> {
    return not(or(left, right));
  }

  export function nand<
    T,
    U extends T = T,
    V extends U = U,
    A extends Array<unknown> = Array<unknown>
  >(left: Predicate<T, U, A>, right: Predicate<T, V, A>): Predicate<T, T, A> {
    return not(and(left, right));
  }

  export function property<
    T,
    K extends keyof T = keyof T,
    A extends Array<unknown> = Array<unknown>
  >(property: K, predicate: Predicate<T[K], T[K], A>): Predicate<T, T, A> {
    return (value, ...args) => predicate(value[property], ...args);
  }

  export function equals<T>(...values: Array<T>): Predicate<unknown, T> {
    return (other) => values.some((value) => Equatable.equals(other, value));
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
