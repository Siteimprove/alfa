import { Refinement } from "@siteimprove/alfa-refinement";

import { Hash } from "./hash";

const { isFunction, isObject } = Refinement;

export interface Hashable {
  hash(hash: Hash): void;
}

export namespace Hashable {
  export function isHashable(value: unknown): value is Hashable {
    return isObject(value) && isFunction(value.hash);
  }

  export function hash(value: Hashable, hash: Hash): void;

  export function hash(value: unknown, hash: Hash): void;

  export function hash(value: unknown, hash: Hash): void {
    if (isHashable(value)) {
      value.hash(hash);
    } else {
      hash.writeUnknown(value);
    }
  }
}
