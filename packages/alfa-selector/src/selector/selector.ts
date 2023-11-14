import { Element } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

import type { Complex } from "./complex";
import type { Compound } from "./compound";
import type { Context } from "../context";
import type { Relative } from "./relative";
import type { Simple } from "./simple";

/**
 * @internal
 */
export abstract class Selector<T extends string = string>
  implements
    Iterable<Simple | Compound | Complex | Relative>,
    Equatable,
    Serializable
{
  private readonly _type: T;

  protected constructor(type: T) {
    this._type = type;
  }

  public get type(): T {
    return this._type;
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#match}
   */
  public abstract matches(element: Element, context?: Context): boolean;

  public abstract equals(value: Selector): boolean;

  public abstract equals(value: unknown): value is this;

  public abstract [Symbol.iterator](): Iterator<
    Simple | Compound | Complex | Relative
  >;

  public toJSON(): Selector.JSON<T> {
    return {
      type: this._type,
    };
  }
}

export namespace Selector {
  export interface JSON<T extends string = string> {
    [key: string]: json.JSON;

    type: T;
  }
}
