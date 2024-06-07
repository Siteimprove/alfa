import { Refinement } from "@siteimprove/alfa-refinement";

import { JSON } from "./json";

const { keys } = Object;
const { isArray } = Array;
const { isFunction, isObject, isString, isNumber, isBoolean, isNull } =
  Refinement;

/**
 * @public
 */
export interface Serializable<
  T extends JSON = JSON,
  O extends Serializable.Options = Serializable.Options,
> {
  toJSON(options?: O): T;
}

/**
 * @public
 */
export namespace Serializable {
  export type ToJSON<T> =
    T extends Serializable<infer U> ? U : T extends JSON ? T : JSON;

  export function isSerializable<T extends JSON>(
    value: unknown,
  ): value is Serializable<T> {
    return isObject(value) && isFunction(value.toJSON);
  }

  export function toJSON<
    T extends JSON,
    O extends Serializable.Options = Serializable.Options,
  >(value: Serializable<T>, options?: O): T;

  export function toJSON<
    T,
    O extends Serializable.Options = Serializable.Options,
  >(value: T, options?: O): ToJSON<T>;

  export function toJSON<O extends Serializable.Options = Serializable.Options>(
    value: unknown,
    options?: O,
  ): JSON {
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

  export enum Verbosity {
    Minimal = 0,
    Low = 100,
    Medium = 200,
    High = 300,
  }

  export interface Options {
    verbosity?: Verbosity;
  }
}
