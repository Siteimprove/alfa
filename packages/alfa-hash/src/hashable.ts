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
}
