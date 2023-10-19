import { Refinement } from "@siteimprove/alfa-refinement";

import { JSON } from "./json";

const { keys } = Object;
const { isArray } = Array;
const { isFunction, isObject, isString, isNumber, isBoolean, isNull } =
  Refinement;

/**
 * @public
 */
export interface Serializable<T extends JSON = JSON, OPTIONS extends unknown = unknown> {
  toJSON(options?: OPTIONS): T;
}

/**
 * @public
 */
export namespace Serializable {
  export type ToJSON<T> = T extends Serializable<infer U>
    ? U
    : T extends JSON
    ? T
    : JSON;

  export function isSerializable<T extends JSON>(
    value: unknown
  ): value is Serializable<T> {
    return isObject(value) && isFunction(value.toJSON);
  }

  export function toJSON<T extends JSON, OPTIONS extends unknown = unknown>(value: Serializable<T>, options?: OPTIONS): T;

  export function toJSON<T, OPTIONS extends unknown = unknown>(value: T, options?: OPTIONS): ToJSON<T>;

  export function toJSON(value: unknown, options?: unknown): JSON {
    if (isSerializable(value)) {
      return value.toJSON(options);
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
        if (value[key] !== undefined) {
          json[key] = toJSON(value[key], options);
        }
      }

      return json;
    }

    return null;
  }
}
