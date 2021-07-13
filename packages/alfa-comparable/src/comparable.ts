import { Refinement } from "@siteimprove/alfa-refinement";

import { Comparison } from "./comparison";

const { isString, isNumber, isBigInt, isBoolean, isFunction, isObject } =
  Refinement;

/**
 * This interface describes strcutures that define a
 * {@link https://en.wikipedia.org/wiki/Total_order | total order}.
 *
 * @example
 * ```ts
 * class Foo implements Comparable<Foo> {
 *   readonly value: number;
 *
 *  constructor(value: number) {
 *    this.value = value;
 *  }
 *
 *  compare(value: Foo): Comparison {
 *    if (this.value < value.value) {
 *      return Comparison.Less;
 *    }
 *
 *    if (this.value > value.value) {
 *      return Comparison.Greater;
 *    }
 *
 *    return Comparison.Equal;
 *  }
 *}
 * ```
 *
 * @public
 */
export interface Comparable<T> {
  /**
   * Compare a value to this.
   */
  compare(value: T): Comparison;
}

/**
 * This namespace provides additional functions for the
 * {@link (Comparable:interface)} interface.
 *
 * @public
 */
export namespace Comparable {
  /**
   * Check if an unknown value implements the {@link (Comparable:interface)}
   * interface.
   */
  export function isComparable<T>(value: unknown): value is Comparable<T> {
    return isObject(value) && isFunction(value.compare);
  }

  /**
   * Compare two strings.
   */
  export function compare(a: string, b: string): Comparison;

  /**
   * Compare two numbers.
   */
  export function compare(a: number, b: number): Comparison;

  /**
   * Compare two big integers.
   */
  export function compare(a: bigint, b: bigint): Comparison;

  /**
   * Compare two booleans.
   */
  export function compare(a: boolean, b: boolean): Comparison;

  /**
   * Compare two comparable values.
   */
  export function compare<T extends Comparable<U>, U = T>(
    a: T,
    b: U
  ): Comparison;

  export function compare(
    a: string | number | bigint | boolean | Comparable<unknown>,
    b: unknown
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
  export function compareComparable<T extends Comparable<U>, U = T>(
    a: T,
    b: U
  ): Comparison {
    return a.compare(b);
  }

  /**
   * Compare two primitive values.
   */
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

  /**
   * Check if one value is less than another.
   */
  export function isLessThan<T>(a: Comparable<T>, b: T): boolean {
    return a.compare(b) < 0;
  }

  /**
   * Check if one value is less than or equal to another.
   */
  export function isLessThanOrEqual<T>(a: Comparable<T>, b: T): boolean {
    return a.compare(b) <= 0;
  }

  /**
   * Check if one value is equal to another
   */
  export function isEqual<T>(a: Comparable<T>, b: T): boolean {
    return a.compare(b) === 0;
  }

  /**
   * Check if one value is greater than another.
   */
  export function isGreaterThan<T>(a: Comparable<T>, b: T): boolean {
    return a.compare(b) > 0;
  }

  /**
   * Check if one value is greater than or equal to another.
   */
  export function isGreaterThanOrEqual<T>(a: Comparable<T>, b: T): boolean {
    return a.compare(b) >= 0;
  }
}
