import { Mapper } from "@siteimprove/alfa-mapper";
import { Predicate } from "@siteimprove/alfa-predicate";

export type Refinement<T, U extends T, A extends Array<unknown> = []> = (
  value: T,
  ...args: A
) => value is U;

export namespace Refinement {
  interface Test {
    <T, U extends T, A extends Array<unknown> = []>(
      refinement: Refinement<T, U, A>,
      value: T,
      ...args: A
    ): value is U;

    <T, A extends Array<unknown> = []>(
      predicate: Predicate<T, A>,
      value: T,
      ...args: A
    ): boolean;
  }

  export const test = Predicate.test as Test;

  interface Fold {
    <T, U extends T, A extends Array<unknown> = [], V = U, W = T>(
      refinement: Refinement<T, U, A>,
      ifTrue: Mapper<U, V>,
      ifFalse: Mapper<T, W>,
      value: T,
      ...args: A
    ): V | W;

    <T, A extends Array<unknown> = [], V = T, W = T>(
      predicate: Predicate<T, A>,
      ifTrue: Mapper<T, V>,
      ifFalse: Mapper<T, W>,
      value: T,
      ...args: A
    ): V | W;
  }

  export const fold = Predicate.fold as Fold;

  interface Not {
    <T, U extends T, A extends Array<unknown> = []>(
      refinement: Refinement<T, U, A>
    ): Refinement<T, Exclude<T, U>, A>;

    <T, A extends Array<unknown> = []>(predicate: Predicate<T, A>): Predicate<
      T,
      A
    >;
  }

  export const not = Predicate.not as Not;

  interface And {
    <T, U extends T, V extends U, A extends Array<unknown> = []>(
      left: Refinement<T, U, A>,
      right: Refinement<U, V, A>
    ): Refinement<T, V, A>;

    <T, U extends T, A extends Array<unknown> = []>(
      left: Refinement<T, U, A>,
      right: Predicate<U, A>
    ): Refinement<T, U, A>;

    <T, U extends T, A extends Array<unknown> = []>(
      left: Predicate<T, A>,
      right: Refinement<T, U, A>
    ): Refinement<T, U, A>;

    <T, A extends Array<unknown> = []>(
      ...predicates: [
        Predicate<T, A>,
        Predicate<T, A>,
        ...Array<Predicate<T, A>>
      ]
    ): Predicate<T, A>;
  }

  export const and = Predicate.and as And;

  interface Or {
    <T, U extends T, V extends T, A extends Array<unknown> = []>(
      left: Refinement<T, U, A>,
      right: Refinement<T, V, A>
    ): Refinement<T, U | V, A>;

    <T, U extends T, A extends Array<unknown> = []>(
      left: Refinement<T, U, A>,
      right: Predicate<T, A>
    ): Refinement<T, U | T, A>;

    <T, U extends T, A extends Array<unknown> = []>(
      left: Predicate<T, A>,
      right: Refinement<T, U, A>
    ): Refinement<T, U | T, A>;

    <T, A extends Array<unknown> = []>(
      ...predicates: [
        Predicate<T, A>,
        Predicate<T, A>,
        ...Array<Predicate<T, A>>
      ]
    ): Predicate<T, A>;
  }

  export const or = Predicate.or as Or;

  interface Xor {
    <T, U extends T, V extends T, A extends Array<unknown> = []>(
      left: Refinement<T, U, A>,
      right: Refinement<T, V, A>
    ): Refinement<T, U | V, A>;

    <T, U extends T, A extends Array<unknown> = []>(
      left: Refinement<T, U, A>,
      right: Predicate<T, A>
    ): Refinement<T, U | T, A>;

    <T, U extends T, A extends Array<unknown> = []>(
      left: Predicate<T, A>,
      right: Refinement<T, U, A>
    ): Refinement<T, U | T, A>;

    <T, A extends Array<unknown> = []>(
      left: Predicate<T, A>,
      right: Predicate<T, A>
    ): Predicate<T, A>;
  }

  export const xor = Predicate.xor as Xor;

  interface Nor {
    <T, U extends T, V extends T, A extends Array<unknown> = []>(
      left: Refinement<T, U, A>,
      right: Refinement<T, V, A>
    ): Refinement<T, Exclude<T, U | V>, A>;

    <T, U extends T, A extends Array<unknown> = []>(
      left: Refinement<T, U, A>,
      right: Predicate<T, A>
    ): Refinement<T, Exclude<T, U>, A>;

    <T, U extends T, A extends Array<unknown> = []>(
      left: Predicate<T, A>,
      right: Refinement<T, U, A>
    ): Refinement<T, Exclude<T, U>, A>;

    <T, A extends Array<unknown> = []>(
      left: Predicate<T, A>,
      right: Predicate<T, A>
    ): Predicate<T, A>;
  }

  export const nor = Predicate.nor as Nor;

  interface Nand {
    <T, U extends T, V extends U, A extends Array<unknown> = []>(
      left: Refinement<T, U, A>,
      right: Refinement<T, V, A>
    ): Refinement<T, Exclude<T, U> | Exclude<T, V>, A>;

    <T, U extends T, A extends Array<unknown> = []>(
      left: Refinement<T, U, A>,
      right: Predicate<T, A>
    ): Predicate<T, A>;

    <T, U extends T, A extends Array<unknown> = []>(
      left: Predicate<T, A>,
      right: Refinement<T, U, A>
    ): Predicate<T, A>;

    <T, A extends Array<unknown> = []>(
      left: Predicate<T, A>,
      right: Predicate<T, A>
    ): Predicate<T, A>;
  }

  export const nand = Predicate.nand as Nand;

  interface Equals {
    <T, U extends T>(...values: Array<U>): Refinement<T, U>;

    <T>(...values: Array<T>): Predicate<unknown>;
  }

  export const equals = Predicate.equals as Equals;

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
