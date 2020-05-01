import { Predicate } from "@siteimprove/alfa-predicate";

import { BuiltinOffset, IntegerOverflow } from "./constants";
import { Hash } from "./hash";

const { isFunction, isObject } = Predicate;

export interface Hashable {
  hash(hash: Hash): void;
}

export namespace Hashable {
  export function isHashable(value: unknown): value is Hashable {
    return isObject(value) && isFunction(value.hash);
  }

  const hashes = new WeakMap<object, number>();

  let uid = 1;

  export function hash(hash: Hash, value: unknown): void {
    switch (typeof value) {
      case "string":
        Hash.writeString(hash, value);
        break;

      case "number":
        Hash.writeNumber(hash, value);
        break;

      case "boolean":
        Hash.writeUint8(hash, BuiltinOffset + (value ? 1 : 0));
        break;

      case "undefined":
        Hash.writeUint32(hash, BuiltinOffset + 2);
        break;

      case "object":
      case "function":
        if (value === null) {
          Hash.writeUint32(hash, BuiltinOffset + 3);
          break;
        }

        if (isObject(value) && isFunction(value.hash)) {
          value.hash(hash);
          break;
        }

        let id = hashes.get(value);

        if (id === undefined) {
          id = uid++;

          if (uid === IntegerOverflow) {
            uid = 0;
          }

          hashes.set(value, id);
        }

        Hash.writeUint32(hash, id);
    }
  }
}
