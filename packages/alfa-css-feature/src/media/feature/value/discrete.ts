import { Equatable } from "@siteimprove/alfa-equatable";
import type * as json from "@siteimprove/alfa-json";
import { Serializable } from "@siteimprove/alfa-json";
import type { Mapper } from "@siteimprove/alfa-mapper";
import type { Refinement } from "@siteimprove/alfa-refinement";

import type { Value } from "./value.js";

/**
 * A non-numerical value, e.g., orientation.
 *
 * @public
 */
export class Discrete<T = unknown>
  implements Value<T>, Serializable<Discrete.JSON<T>>
{
  public static of<T>(value: T): Discrete<T> {
    return new Discrete(value);
  }

  private readonly _value: T;

  private constructor(value: T) {
    this._value = value;
  }

  public get value(): T {
    return this._value;
  }

  public map<U>(mapper: Mapper<T, U>): Discrete<U> {
    return new Discrete(mapper(this._value));
  }

  public matches(value: T): boolean {
    return Equatable.equals(this._value, value);
  }

  public hasValue<U extends T>(
    refinement: Refinement<T, U>,
  ): this is Discrete<U> {
    return refinement(this._value);
  }

  public toJSON(): Discrete.JSON<T> {
    return {
      type: "discrete",
      value: Serializable.toJSON(this._value),
    };
  }
}

/**
 * @public
 */
export namespace Discrete {
  export interface JSON<T> {
    [key: string]: json.JSON;
    type: "discrete";
    value: Serializable.ToJSON<T>;
  }

  export function isDiscrete<T>(value: unknown): value is Discrete<T> {
    return value instanceof Discrete;
  }
}
