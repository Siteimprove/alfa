import { Element } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

import type { Context } from "../context";

import type { Complex } from "./complex";
import type { Compound } from "./compound";
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

  public equals(value: Selector): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Selector && value._type === this._type;
  }

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

/**
 * Selectors who also contain a name.
 *
 * @remarks
 * This can be either specific (e.g., the id is the name of an Id selector),
 * or generic (e.g., "focus" is the name of the `:focus` pseudo-class).
 *
 * @internal
 */
export abstract class WithName<
  T extends string = string,
  N extends string = string,
> extends Selector<T> {
  protected readonly _name: N;
  protected constructor(type: T, name: N) {
    super(type);
    this._name = name;
  }

  public get name(): N {
    return this._name;
  }

  public equals(value: WithName): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof WithName &&
      super.equals(value) &&
      value._name === this._name
    );
  }

  public toJSON(): WithName.JSON<T, N> {
    return {
      ...super.toJSON(),
      name: this._name,
    };
  }
}

export namespace WithName {
  export interface JSON<T extends string = string, N extends string = string>
    extends Selector.JSON<T> {
    name: N;
  }
}
