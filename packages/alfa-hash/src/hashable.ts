import { BuiltinOffset, IntegerOverflow } from "./constants";
import { Hash } from "./hash";

export interface Hashable {
  hash(hash: Hash): void;
}

export namespace Hashable {
  function isObject(value: unknown): value is { [key: string]: unknown } {
    return typeof value === "object" && value !== null;
  }

  function isFunction(value: unknown): value is Function {
    return typeof value === "function";
  }

  export function isHashable(value: unknown): value is Hashable {
    return isObject(value) && isFunction(value.hash);
  }

  const hashes = new WeakMap<object, number>();

  let uid = 1;

  export function hash(value: unknown, hash: Hash): void {
    if (isObject(value)) {
      value = value.valueOf();
    }

    switch (typeof value) {
      case "string":
        return Hash.writeString(hash, value);

      case "number":
        return Hash.writeNumber(hash, value);

      case "boolean":
        return Hash.writeUint8(hash, BuiltinOffset + (value ? 1 : 0));

      case "undefined":
        return Hash.writeUint32(hash, BuiltinOffset + 2);

      case "object":
      case "function":
        if (value === null) {
          return Hash.writeUint32(hash, BuiltinOffset + 3);
        }

        if (isObject(value) && isFunction(value.hash)) {
          return value.hash(hash);
        }

        let id = hashes.get(value);

        if (id === undefined) {
          id = uid++;

          if (uid === IntegerOverflow) {
            uid = 0;
          }

          hashes.set(value, id);
        }

        return Hash.writeUint32(hash, id);
    }
  }
}
