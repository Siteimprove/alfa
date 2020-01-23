/// <reference lib="dom" />
import { Predicate } from "@siteimprove/alfa-predicate";

import { JSON } from "./json";

const { keys } = Object;
const { isArray } = Array;
const {
  isFunction,
  isObject,
  isString,
  isNumber,
  isBoolean,
  isNull
} = Predicate;

export interface Serializable {
  toJSON(): JSON;
}

export namespace Serializable {
  export function isSerializable(value: unknown): value is Serializable {
    return isObject(value) && isFunction(value.toJSON);
  }

  export function toJSON(value: unknown): JSON {
    if (isSerializable(value)) {
      return value.toJSON();
    }

    if (
      isString(value) ||
      isNumber(value) ||
      isBoolean(value) ||
      isNull(value)
    ) {
      return value;
    }

    if (isArray(value)) {
      return value.map(toJSON);
    }

    if (isObject(value)) {
      const json: Record<string, JSON> = {};

      for (const key of keys(value)) {
        json[key] = toJSON(value[key]);
      }

      return json;
    }

    return null;
  }
}
