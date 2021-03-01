import { Option, Some, None } from "@siteimprove/alfa-option";
import { Refinement } from "@siteimprove/alfa-refinement";

import { SARIF } from "./sarif";

const { isFunction, isObject } = Refinement;

/**
 * @public
 */
export interface Serializable<T extends SARIF = SARIF> {
  toSARIF(): T;
}

/**
 * @public
 */
export namespace Serializable {
  export function isSerializable<T extends SARIF>(
    value: unknown
  ): value is Serializable<T> {
    return isObject(value) && isFunction(value.toSARIF);
  }

  export function toSARIF<T extends SARIF>(value: Serializable<T>): Some<T>;

  export function toSARIF(value: unknown): Option<SARIF>;

  export function toSARIF(value: unknown): Option<SARIF> {
    if (isSerializable(value)) {
      return Some.of(value.toSARIF());
    }

    return None;
  }
}
