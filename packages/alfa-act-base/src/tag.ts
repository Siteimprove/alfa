import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

/**
 * @public
 */
export abstract class Tag<T extends string = string>
  implements Equatable, Serializable<Tag.JSON> {
  protected constructor() {}

  public abstract get type(): T;

  public equals(value: Tag): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Tag && value.type === this.type;
  }

  public toJSON(): Tag.JSON<T> {
    return {
      type: this.type,
    };
  }
}

/**
 * @public
 */
export namespace Tag {
  export interface JSON<T extends string = string> {
    [key: string]: json.JSON;
    type: T;
  }

  export function isTag<T extends string>(
    value: unknown,
    type?: T
  ): value is Tag<T> {
    return value instanceof Tag && (type === undefined || value.type === type);
  }
}
