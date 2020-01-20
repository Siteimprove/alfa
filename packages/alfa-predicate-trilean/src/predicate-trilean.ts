import { Equatable } from "@siteimprove/alfa-equatable";
import { Mapper } from "@siteimprove/alfa-mapper";

type Trilean = boolean | undefined;

export type PredicateTrilean<T, A extends Array<unknown> = Array<unknown>> = (
  value: T,
  ...args: A
) => Trilean;

export namespace PredicateTrilean {
  export function test<T>(predicate: PredicateTrilean<T>, value: T): Trilean {
    return predicate(value);
  }

  export function fold<T, V, W, X>(
    predicate: PredicateTrilean<T>,
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

  export function not<T>(predicate: PredicateTrilean<T>): PredicateTrilean<T> {
    return function not(value) {
      return fold(predicate, value, contradiction, tautology, unknown);
    };
  }

  export function and<T>(
    left: PredicateTrilean<T>,
    right: PredicateTrilean<T>
  ): PredicateTrilean<T> {
    return function and(value) {
      return fold(left, value, right, contradiction, value =>
        fold(right, value, unknown, contradiction, unknown)
      );
    };
  }

  export function or<T>(
    left: PredicateTrilean<T>,
    right: PredicateTrilean<T>
  ): PredicateTrilean<T> {
    return function or(value) {
      return fold(left, value, tautology, right, value =>
        fold(right, value, tautology, unknown, unknown)
      );
    };
  }

  export function xor<T>(
    left: PredicateTrilean<T>,
    right: PredicateTrilean<T>
  ): PredicateTrilean<T> {
    return and(or(left, right), not(and(left, right)));
  }

  export function nor<T>(
    left: PredicateTrilean<T>,
    right: PredicateTrilean<T>
  ): PredicateTrilean<T> {
    return not(or(left, right));
  }

  export function nand<T>(
    left: PredicateTrilean<T>,
    right: PredicateTrilean<T>
  ): PredicateTrilean<T> {
    return not(and(left, right));
  }

  export function equals<T>(...values: Array<T>): PredicateTrilean<T> {
    return function equals(other) {
      return values.some(value => Equatable.equals(other, value));
    };
  }

  export function property<T, K extends keyof T>(
    property: K,
    predicate: PredicateTrilean<T[K]>
  ): PredicateTrilean<T> {
    return value => predicate(value[property]);
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
