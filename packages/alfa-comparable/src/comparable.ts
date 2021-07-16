import { Refinement } from "@siteimprove/alfa-refinement";

import { Comparison } from "./comparison";

const {
  isString,
  isNumber,
  isBigInt,
  isBoolean,
  isFunction,
  isObject,
} = Refinement;

/**
 * @public
 */
export interface Comparable<T> {
  compare(value: T): Comparison;
}

/**
 * @public
 */
export namespace Comparable {
  export function isComparable<T>(value: unknown): value is Comparable<T> {
    return isObject(value) && isFunction(value.compare);
  }

  export function compare(a: string, b: string): Comparison;

  export function compare(a: number, b: number): Comparison;

  export function compare(a: bigint, b: bigint): Comparison;

  export function compare(a: boolean, b: boolean): Comparison;

  export function compare<T>(a: Comparable<T>, b: T): Comparison;

  export function compare<T extends unknown>(
    a: string | number | bigint | boolean | Comparable<T>,
    b: T
  ): Comparison {
    if (isString(a)) {
      return compareString(a, b as string);
    }

    if (isNumber(a)) {
      return compareNumber(a, b as number);
    }

    if (isBigInt(a)) {
      return compareBigInt(a, b as bigint);
    }

    if (isBoolean(a)) {
      return compareBoolean(a, b as boolean);
    }

    return compareComparable(a, b);
  }

  /**
   * @remarks
   * This should only be used in cases where branch mispredictions caused by the
   * more general {@link (Comparable:namespace).(compare:1)} are undesired.
   */
  export function compareString(a: string, b: string): Comparison {
    return comparePrimitive(a, b);
  }

  /**
   * @remarks
   * This should only be used in cases where branch mispredictions caused by the
   * more general {@link (Comparable:namespace).(compare:2)} are undesired.
   */
  export function compareNumber(a: number, b: number): Comparison {
    return comparePrimitive(a, b);
  }

  /**
   * @remarks
   * This should only be used in cases where branch mispredictions caused by the
   * more general {@link (Comparable:namespace).(compare:3)} are undesired.
   */
  export function compareBigInt(a: bigint, b: bigint): Comparison {
    return comparePrimitive(a, b);
  }

  /**
   * @remarks
   * This should only be used in cases where branch mispredictions caused by the
   * more general {@link (Comparable:namespace).(compare:4)} are undesired.
   */
  export function compareBoolean(a: boolean, b: boolean): Comparison {
    return comparePrimitive(a, b);
  }

  /**
   * @remarks
   * This should only be used in cases where branch mispredictions caused by the
   * more general {@link (Comparable:namespace).(compare:5)} are undesired.
   */
  export function compareComparable<T>(a: Comparable<T>, b: T): Comparison {
    return a.compare(b);
  }

  function comparePrimitive<T extends string | number | bigint | boolean>(
    a: T,
    b: T
  ): Comparison {
    if (a < b) {
      return Comparison.Less;
    }

    if (a > b) {
      return Comparison.Greater;
    }

    return Comparison.Equal;
  }

  export function isLessThan<T>(a: Comparable<T>, b: T): boolean {
    return a.compare(b) < 0;
  }

  export function isLessThanOrEqual<T>(a: Comparable<T>, b: T): boolean {
    return a.compare(b) <= 0;
  }

  export function isGreaterThan<T>(a: Comparable<T>, b: T): boolean {
    return a.compare(b) > 0;
  }

  export function isGreaterThanOrEqual<T>(a: Comparable<T>, b: T): boolean {
    return a.compare(b) >= 0;
  }
}
