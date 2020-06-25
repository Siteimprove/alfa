import { Equatable } from "@siteimprove/alfa-equatable";
import { Mapper } from "@siteimprove/alfa-mapper";

import { Trilean } from "./trilean";

export type Predicate<T, A extends Array<unknown> = []> = (
  value: T,
  ...args: A
) => Trilean;

export namespace Predicate {
  export function test<T>(predicate: Predicate<T>, value: T): Trilean {
    return predicate(value);
  }

  export function fold<T, V, W, X>(
    predicate: Predicate<T>,
    value: T,
    ifTrue: Mapper<T, V>,
    ifFalse: Mapper<T, W>,
    ifUndefined: Mapper<T, X>
  ): V | W | X {
    switch (predicate(value)) {
      case true:
        return ifTrue(value);
      case false:
        return ifFalse(value);
      case undefined:
        return ifUndefined(value);
    }
  }

  export function not<T>(predicate: Predicate<T>): Predicate<T> {
    return function not(value) {
      return fold(predicate, value, contradiction, tautology, unknown);
    };
  }

  export function and<T>(
    left: Predicate<T>,
    right: Predicate<T>
  ): Predicate<T> {
    return function and(value) {
      return fold(left, value, right, contradiction, (value) =>
        fold(right, value, unknown, contradiction, unknown)
      );
    };
  }

  export function or<T>(left: Predicate<T>, right: Predicate<T>): Predicate<T> {
    return function or(value) {
      return fold(left, value, tautology, right, (value) =>
        fold(right, value, tautology, unknown, unknown)
      );
    };
  }

  export function xor<T>(
    left: Predicate<T>,
    right: Predicate<T>
  ): Predicate<T> {
    return and(or(left, right), not(and(left, right)));
  }

  export function nor<T>(
    left: Predicate<T>,
    right: Predicate<T>
  ): Predicate<T> {
    return not(or(left, right));
  }

  export function nand<T>(
    left: Predicate<T>,
    right: Predicate<T>
  ): Predicate<T> {
    return not(and(left, right));
  }

  export function equals<T>(...values: Array<T>): Predicate<T> {
    return function equals(other) {
      return values.some((value) => Equatable.equals(other, value));
    };
  }

  export function property<T, K extends keyof T>(
    property: K,
    predicate: Predicate<T[K]>
  ): Predicate<T> {
    return (value) => predicate(value[property]);
  }
}

function tautology(): true {
  return true;
}

function contradiction(): false {
  return false;
}

function unknown(): undefined {
  return undefined;
}
