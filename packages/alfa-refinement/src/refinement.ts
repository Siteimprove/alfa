import { Equatable } from "@siteimprove/alfa-equatable";
import { Mapper } from "@siteimprove/alfa-mapper";

export type Refinement<T, U extends T, A extends Array<unknown> = []> = (
  value: T,
  ...args: A
) => value is U;

export namespace Refinement {
  export function test<T, U extends T, A extends Array<unknown> = []>(
    refinement: Refinement<T, U, A>,
    value: T,
    ...args: A
  ): value is U {
    return refinement(value, ...args);
  }

  export function fold<
    T,
    U extends T,
    A extends Array<unknown> = [],
    V = U,
    W = T
  >(
    refinement: Refinement<T, U, A>,
    ifTrue: Mapper<U, V>,
    ifFalse: Mapper<T, W>,
    value: T,
    ...args: A
  ): V | W {
    return refinement(value, ...args) ? ifTrue(value) : ifFalse(value);
  }

  export function not<T, U extends T, A extends Array<unknown> = []>(
    refinement: Refinement<T, U, A>
  ): Refinement<T, Exclude<T, U>, A> {
    return (value, ...args): value is Exclude<T, U> =>
      !refinement(value, ...args);
  }

  export function and<
    T,
    U extends T,
    V extends U,
    A extends Array<unknown> = []
  >(
    left: Refinement<T, U, A>,
    right: Refinement<U, V, A>
  ): Refinement<T, V, A> {
    return (value, ...args): value is V =>
      left(value, ...args) && right(value, ...args);
  }

  export function or<
    T,
    U extends T,
    V extends T,
    A extends Array<unknown> = []
  >(
    left: Refinement<T, U, A>,
    right: Refinement<T, V, A>
  ): Refinement<T, U | V, A> {
    return (value, ...args): value is U | V =>
      left(value, ...args) || right(value, ...args);
  }

  export function xor<
    T,
    U extends T,
    V extends T,
    A extends Array<unknown> = []
  >(
    left: Refinement<T, U, A>,
    right: Refinement<T, V, A>
  ): Refinement<T, U | V, A> {
    return and(or(left, right), not(and<T, T, T, A>(left, right)));
  }

  export function nor<
    T,
    U extends T,
    V extends T,
    A extends Array<unknown> = []
  >(
    left: Refinement<T, U, A>,
    right: Refinement<T, V, A>
  ): Refinement<T, Exclude<T, U | V>, A> {
    return not(or(left, right));
  }

  export function nand<
    T,
    U extends T,
    V extends U,
    A extends Array<unknown> = []
  >(
    left: Refinement<T, U, A>,
    right: Refinement<T, V, A>
  ): Refinement<T, Exclude<T, U> | Exclude<T, V>, A> {
    return not(and(left, right));
  }

  export function equals<T, U extends T>(
    ...values: Array<U>
  ): Refinement<T, U> {
    return (other): other is U =>
      values.some((value) => Equatable.equals(other, value));
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
