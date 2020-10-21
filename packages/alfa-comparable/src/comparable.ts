import { Comparison } from "./comparison";

export interface Comparable<T> {
  compare(value: T): Comparison;
}

export namespace Comparable {
  function isFunction(value: unknown): value is Function {
    return typeof value === "function";
  }

  function isObject(value: unknown): value is { [key: string]: unknown } {
    return typeof value === "object" && value !== null;
  }

  export function isComparable<T>(value: unknown): value is Comparable<T> {
    return isObject(value) && isFunction(value.compare);
  }

  export function compare<T extends Comparable<U>, U>(a: T, b: U): Comparison {
    return a.compare(b);
  }
}
