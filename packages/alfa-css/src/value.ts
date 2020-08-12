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

export * from "./value/angle";
export * from "./value/color";
export * from "./value/color/current";
export * from "./value/color/hex";
export * from "./value/color/hsl";
export * from "./value/color/named";
export * from "./value/color/rgb";
export * from "./value/color/system";
export * from "./value/converter";
export * from "./value/gradient";
export * from "./value/gradient/linear";
export * from "./value/image";
export * from "./value/integer";
export * from "./value/keyword";
export * from "./value/length";
export * from "./value/number";
export * from "./value/numeric";
export * from "./value/percentage";
export * from "./value/position";
export * from "./value/string";
export * from "./value/transform";
export * from "./value/transform/matrix";
export * from "./value/transform/perspective";
export * from "./value/transform/rotate";
export * from "./value/transform/scale";
export * from "./value/transform/skew";
export * from "./value/transform/translate";
export * from "./value/unit";
export * from "./value/url";
