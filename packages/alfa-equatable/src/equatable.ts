export interface Equatable {
  equals(value: this): boolean;
  equals(value: unknown): value is this;
}

export namespace Equatable {
  function isFunction(value: unknown): value is Function {
    return typeof value === "function";
  }

  function isObject(value: unknown): value is { [key: string]: unknown } {
    return typeof value === "object" && value !== null;
  }

  export function isEquatable<T>(value: unknown): value is Equatable {
    return isObject(value) && isFunction(value.equals);
  }

  export function equals(a: unknown, b: unknown): boolean {
    if (a === b || (a !== a && b !== b)) {
      return true;
    }

    if (Equatable.isEquatable(a)) {
      return a.equals(b);
    }

    if (Equatable.isEquatable(b)) {
      return b.equals(a);
    }

    return false;
  }
}
