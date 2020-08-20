import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

export abstract class Tag<T extends string = string>
  implements Equatable, Serializable {
  protected constructor() {}

  public abstract get type(): T;

  public equals(value: unknown): value is this {
    return value instanceof Tag && value.type === this.type;
  }

  public toJSON(): Tag.JSON {
    return {
      type: this.type,
    };
  }
}

export namespace Tag {
  export interface JSON {
    [key: string]: json.JSON;
    type: string;
  }

  export function isTag<T extends string>(
    value: unknown,
    type?: T
  ): value is Tag<T> {
    return value instanceof Tag && (type === undefined || value.type === type);
  }
}
