import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

export abstract class Value<T extends string = string>
  implements Equatable, Hashable, Serializable {
  protected constructor() {}

  public abstract get type(): T;

  public abstract equals(value: unknown): value is this;

  public abstract hash(hash: Hash): void;

  public abstract toJSON(): Value.JSON;

  public abstract toString(): string;
}

export namespace Value {
  export interface JSON {
    [key: string]: json.JSON;
    type: string;
  }

  export function isValue<T extends string>(
    value: unknown,
    type?: T
  ): value is Value<T> {
    return (
      value instanceof Value && (type === undefined || value.type === type)
    );
  }
}
