import { Option, Some, None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import { EARL } from "./earl";

const { isFunction, isObject } = Predicate;

export interface Serializable {
  toEARL(): EARL;
}

export namespace Serializable {
  export function isSerializable(value: unknown): value is Serializable {
    return isObject(value) && isFunction(value.toEARL);
  }

  export function toEARL(value: unknown): Option<EARL> {
    if (isSerializable(value)) {
      return Some.of(value.toEARL());
    }

    return None;
  }
}
