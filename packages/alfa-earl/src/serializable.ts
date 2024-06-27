import { Option, Some, None } from "@siteimprove/alfa-option";
import { Refinement } from "@siteimprove/alfa-refinement";

import { EARL } from "./earl.js";

const { isFunction, isObject } = Refinement;

/**
 * @public
 */
export interface Serializable<T extends EARL = EARL> {
  toEARL(): T;
}

/**
 * @public
 */
export namespace Serializable {
  export function isSerializable<T extends EARL>(
    value: unknown,
  ): value is Serializable<T> {
    return isObject(value) && isFunction(value.toEARL);
  }

  export function toEARL<T extends EARL>(value: Serializable<T>): Some<T>;

  export function toEARL(value: unknown): Option<EARL>;

  export function toEARL(value: unknown): Option<EARL> {
    if (isSerializable(value)) {
      return Some.of(value.toEARL());
    }

    return None;
  }
}
