/// <reference lib="dom" />

import { Refinement } from "@siteimprove/alfa-refinement";

import { JSON } from "./json";

const { keys } = Object;
const { isArray } = Array;
const {
  isFunction,
  isObject,
  isString,
  isNumber,
  isBoolean,
  isNull,
} = Refinement;

export interface Serializable<T extends JSON = JSON> {
  toJSON(): T;
}

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

  export function toJSON<T extends JSON>(value: Serializable<T>): T;

  export function toJSON<T>(value: T): ToJSON<T>;

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
        if (value[key] !== undefined) {
          json[key] = toJSON(value[key]);
        }
      }

      return json;
    }

    return null;
  }
}
