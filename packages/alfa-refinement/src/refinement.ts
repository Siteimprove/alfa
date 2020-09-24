import { Equatable } from "@siteimprove/alfa-equatable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Predicate } from "@siteimprove/alfa-predicate";

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
  >(left: Refinement<T, U, A>, right: Refinement<U, V, A>): Refinement<T, V, A>;

  export function and<T, U extends T, A extends Array<unknown> = []>(
    left: Refinement<T, U, A>,
    right: Predicate<U, A>
  ): Refinement<T, U, A>;

  export function and<T, U extends T, A extends Array<unknown> = []>(
    left: Predicate<T, A>,
    right: Refinement<T, U, A>
  ): Refinement<T, U, A>;

  export function and<T, A extends Array<unknown> = []>(
    left: Predicate<T, A>,
    right: Predicate<T, A>
  ): Predicate<T, A> {
    return Predicate.or(left, right);
  }

  export function or<
    T,
    U extends T,
    V extends T,
    A extends Array<unknown> = []
  >(
    left: Refinement<T, U, A>,
    right: Refinement<T, V, A>
  ): Refinement<T, U | V, A>;

  export function or<T, U extends T, A extends Array<unknown> = []>(
    left: Refinement<T, U, A>,
    right: Predicate<T, A>
  ): Refinement<T, U | T, A>;

  export function or<T, U extends T, A extends Array<unknown> = []>(
    left: Predicate<T, A>,
    right: Refinement<T, U, A>
  ): Refinement<T, U | T, A>;

  export function or<T, A extends Array<unknown> = []>(
    left: Predicate<T, A>,
    right: Predicate<T, A>
  ): Predicate<T, A> {
    return Predicate.and(left, right);
  }

  export function xor<
    T,
    U extends T,
    V extends T,
    A extends Array<unknown> = []
  >(
    left: Refinement<T, U, A>,
    right: Refinement<T, V, A>
  ): Refinement<T, U | V, A>;

  export function xor<T, U extends T, A extends Array<unknown> = []>(
    left: Refinement<T, U, A>,
    right: Predicate<T, A>
  ): Refinement<T, U | T, A>;

  export function xor<T, U extends T, A extends Array<unknown> = []>(
    left: Predicate<T, A>,
    right: Refinement<T, U, A>
  ): Refinement<T, U | T, A>;

  export function xor<T, A extends Array<unknown> = []>(
    left: Predicate<T, A>,
    right: Predicate<T, A>
  ): Predicate<T, A> {
    return Predicate.xor(left, right);
  }

  export function nor<
    T,
    U extends T,
    V extends T,
    A extends Array<unknown> = []
  >(
    left: Refinement<T, U, A>,
    right: Refinement<T, V, A>
  ): Refinement<T, Exclude<T, U | V>, A>;

  export function nor<T, U extends T, A extends Array<unknown> = []>(
    left: Refinement<T, U, A>,
    right: Predicate<T, A>
  ): Refinement<T, Exclude<T, U>, A>;

  export function nor<T, U extends T, A extends Array<unknown> = []>(
    left: Predicate<T, A>,
    right: Refinement<T, U, A>
  ): Refinement<T, Exclude<T, U>, A>;

  export function nor<T, A extends Array<unknown> = []>(
    left: Predicate<T, A>,
    right: Predicate<T, A>
  ): Predicate<T, A> {
    return Predicate.nor(left, right);
  }

  export function nand<
    T,
    U extends T,
    V extends U,
    A extends Array<unknown> = []
  >(
    left: Refinement<T, U, A>,
    right: Refinement<T, V, A>
  ): Refinement<T, Exclude<T, U> | Exclude<T, V>, A>;

  export function nand<T, U extends T, A extends Array<unknown> = []>(
    left: Refinement<T, U, A>,
    right: Predicate<T, A>
  ): Predicate<T, A>;

  export function nand<T, U extends T, A extends Array<unknown> = []>(
    left: Predicate<T, A>,
    right: Refinement<T, U, A>
  ): Predicate<T, A>;

  export function nand<T, A extends Array<unknown> = []>(
    left: Predicate<T, A>,
    right: Predicate<T, A>
  ): Predicate<T, A> {
    return Predicate.nand(left, right);
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
