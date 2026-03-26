import type { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import type { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";

import * as json from "@siteimprove/alfa-json";

import type { Sheet } from "../sheet.js";

/**
 * @public
 */
export abstract class BaseRule<T extends string = string>
  implements Equatable, Serializable
{
  protected _owner: Option<Sheet> = None;
  protected _parent: Option<BaseRule> = None;
  private readonly _type: T;

  protected constructor(type: T) {
    this._type = type;
  }

  public get type(): T {
    return this._type;
  }

  public get owner(): Option<Sheet> {
    return this._owner;
  }

  public get parent(): Option<BaseRule> {
    return this._parent;
  }

  public *children(): Iterable<BaseRule> {}

  public *descendants(): Iterable<BaseRule> {
    for (const child of this.children()) {
      yield child;
      yield* child.descendants();
    }
  }

  public *ancestors(): Iterable<BaseRule> {
    for (const parent of this._parent) {
      yield parent;
      yield* parent.ancestors();
    }
  }

  public equals(value: unknown): value is this {
    return value === this;
  }

  public toJSON(): BaseRule.JSON<T> {
    return { type: this._type };
  }

  /**
   * @internal
   */
  public _attachOwner(owner: Sheet): boolean {
    if (this._owner.isSome()) {
      return false;
    }

    this._owner = Option.of(owner);

    // Recursively attach the owner to all children.
    return Iterable.every(this.children(), (rule) => rule._attachOwner(owner));
  }

  /**
   * @internal
   */
  public _attachParent(parent: BaseRule): boolean {
    if (this._parent.isSome()) {
      return false;
    }

    this._parent = Option.of(parent);

    return true;
  }
}

/**
 * @public
 */
export namespace BaseRule {
  export interface JSON<T extends string = string> {
    [key: string]: json.JSON;
    type: T;
  }
}
