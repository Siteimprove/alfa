import type { Element } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";

import type { Context } from "../context";
import { Specificity } from "../specificity";

import type { Complex } from "./complex";
import type { Compound } from "./compound";
import type { Relative } from "./relative";
import type { Class, Id, Simple, Type } from "./simple";

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
  private readonly _specificity: Specificity;

  /**
   * The key selector is used to optimise matching of complex (and compound)
   * selectors.
   *
   * @remarks
   * The key selector is the rightmost simple selector in a complex selector,
   * or the leftmost simple selector in a compound selector. In order for an
   * element to match a complex selector, it must match the key selector.
   *
   * For example, consider selector `main .foo + div`. Any element matching it
   * must necessarily be a `<div>`, and for other elements there is no need to
   * waste time traversing the DOM tree to check siblings or ancestors.
   *
   * For compound selectors, e.g. `.foo.bar`, any part could be taken, and we
   * arbitrarily pick the leftmost.
   *
   * Conversely, an `<img id="image" class="foo bar">` can only match selectors
   * whose key selector is `img`, `#image`, `.foo`, or `.bar`. So we can
   * pre-filter these when attempting matching.
   *
   * @privateRemarks
   * Key selectors are not part of the CSS specification, but are a useful tool
   * for optimising selector matching.
   *
   * Key selectors relate to cascading more than selector syntax and matching,
   * but they only depend on selector and thus make sense as instance properties.
   *
   * {@link http://doc.servo.org/style/selector_map/struct.SelectorMap.html}
   */
  protected readonly _key: Option<Id | Class | Type> = None;

  protected constructor(type: T, specificity: Specificity) {
    this._type = type;
    this._specificity = specificity;
  }

  public get type(): T {
    return this._type;
  }

  public get specificity(): Specificity {
    return this._specificity;
  }

  public get key(): Option<Id | Class | Type> {
    return this._key;
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#match}
   */
  public abstract matches(element: Element, context?: Context): boolean;

  public equals(value: Selector): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Selector &&
      value._type === this._type &&
      value._specificity.equals(this._specificity)
    );
  }

  public abstract [Symbol.iterator](): Iterator<
    Simple | Compound | Complex | Relative
  >;

  public toJSON(): Selector.JSON<T> {
    return {
      type: this._type,
      specificity: this._specificity.toJSON(),
      ...(this._key.isSome() ? { key: `${this._key.get()}` } : {}),
    };
  }
}

export namespace Selector {
  export interface JSON<T extends string = string> {
    [key: string]: json.JSON | undefined;

    type: T;
    specificity: Specificity.JSON;
    // Since the key selector may be the selector itself, we only return its
    // string representation to avoid infinite recursion.
    key?: string;
  }
}

/**
 * Selectors who also contain a name.
 *
 * @remarks
 * This can be either specific (e.g., the id is the name of a #foo selector),
 * or generic (e.g., "focus" is the name of the `:focus` pseudo-class).
 *
 * @internal
 */
export abstract class WithName<
  T extends string = string,
  N extends string = string,
> extends Selector<T> {
  protected readonly _name: N;
  protected constructor(type: T, name: N, specificity: Specificity) {
    super(type, specificity);
    this._name = name;
  }

  public get name(): N {
    return this._name;
  }

  public matches(element: Element, context?: Context): boolean {
    return false;
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
