import { isFunction, isObject } from "@siteimprove/alfa-guards";

export interface Equality<T = unknown> {
  equals(value: unknown): value is T;
}

export namespace Equality {
  export function isEquality<T>(value: unknown): value is Equality<T> {
    return isObject(value) && isFunction(value.equals);
  }

  export function equals(a: unknown, b: unknown): boolean {
    if (isObject(a)) {
      a = a.valueOf();
    }

    if (isObject(b)) {
      b = b.valueOf();
    }

    if (a === b || (a !== a && b !== b)) {
      return true;
    }

    if (Equality.isEquality(a)) {
      return a.equals(b);
    }

    if (Equality.isEquality(b)) {
      return b.equals(a);
    }

    return false;
  }
}
