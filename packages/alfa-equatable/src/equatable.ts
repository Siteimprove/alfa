/**
 * This interface describes structures that define an
 * {@link https://en.wikipedia.org/wiki/Equivalence_relation | equivalence relation}.
 *
 * @example
 * ```ts
 * class Foo implements Equatable {
 *   readonly value: number;
 *
 *   constructor(value: number) {
 *     this.value = value;
 *   }
 *
 *   equals(value: Foo): boolean;
 *
 *   equals(value: unknown): value is this;
 *
 *   equals(value: unknown): boolean {
 *     return value instanceof Foo && value.value === this.value;
 *   }
 * }
 * ```
 *
 * @public
 */
export interface Equatable {
  /**
   * Check if a value of the same type as this are equal.
   *
   * @remarks
   * This function does not further refine the type of the given value.
   */
  equals(value: this): boolean;

  /**
   * Check if a value of an unknown type is equal to this.
   *
   * @remarks
   * This function refines the type of the given value.
   */
  equals(value: unknown): value is this;
}

/**
 * This namespace provides additional types and functions for the
 * {@link (Equatable:interface)} interface.
 *
 * @public
 */
export namespace Equatable {
  // The following two type guards have been inlined from the
  // @siteimprove/alfa-refinement package to avoid creating a circular
  // dependency.

  function isFunction(value: unknown): value is Function {
    return typeof value === "function";
  }

  function isObject(value: unknown): value is { [key: string]: unknown } {
    return typeof value === "object" && value !== null;
  }

  /**
   * Check if an unknown value implements the {@link (Equatable:interface)}
   * interface.
   */
  export function isEquatable(value: unknown): value is Equatable {
    return isObject(value) && isFunction(value.equals);
  }

  /**
   * Check if two unknown values are equal.
   *
   * @remarks
   * If either of the given values implement the {@link (Equatable:interface)}
   * interface, the equivalence constraints of the value will be used. If not,
   * strict equality will be used with the additional constraint that `NaN` is
   * equal to itself.
   */
  export function equals(a: unknown, b: unknown): boolean {
    if (
      a === b ||
      // `NaN` is the only value in JavaScript that is not equal to itself.
      (a !== a && b !== b)
    ) {
      return true;
    }

    if (isEquatable(a)) {
      return a.equals(b);
    }

    if (isEquatable(b)) {
      return b.equals(a);
    }

    return false;
  }
}
