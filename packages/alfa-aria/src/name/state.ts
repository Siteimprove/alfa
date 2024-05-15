import { Array } from "@siteimprove/alfa-array";
import type { Element } from "@siteimprove/alfa-dom";
import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Iterable } from "@siteimprove/alfa-iterable";
import type { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";

import * as json from "@siteimprove/alfa-json";

/**
 * @internal
 */
export class State implements Equatable, Serializable<State.JSON> {
  private static _empty = new State([], None, None, false, false);

  public static empty(): State {
    return this._empty;
  }

  private readonly _visited: Array<Element>;
  // which element has an aria-labelledby causing the current traversal?
  private readonly _referrer: Option<Element>;
  // which element was the target of aria-labelledby?
  private readonly _referred: Option<Element>;
  private readonly _isRecursing: boolean;
  private readonly _isDescending: boolean;

  private constructor(
    visited: Array<Element>,
    referrer: Option<Element>,
    referred: Option<Element>,
    isRecursing: boolean,
    isDescending: boolean,
  ) {
    this._visited = visited;
    this._referrer = referrer;
    this._referred = referred;
    this._isRecursing = isRecursing;
    this._isDescending = isDescending;
  }

  /**
   * The elements that have been seen by the name computation so far. This is
   * used for detecting circular references resulting from things such as the
   * `aria-labelledby` attribute and form controls that get their name from
   * a containing `<label>` element.
   */
  public get visited(): Iterable<Element> {
    return this._visited;
  }

  /**
   * The element that referenced the name computation.
   * E.g the element on which aria-labelledby is set
   * or the <input> element being labelled by a <label> element.
   */
  public get referrer(): Option<Element> {
    return this._referrer;
  }

  /**
   * The element that is referenced during the name computation.
   * E.g the target of the aria-labelledby attribute
   * or the <label> element that labels an <input> element.
   */
  public get referred(): Option<Element> {
    return this._referred;
  }

  /**
   * Whether the name computation is the result of recursion.
   */
  public get isRecursing(): boolean {
    return this._isRecursing;
  }

  /**
   * Whether the name computation is the result of a reference.
   */
  public get isReferencing(): boolean {
    return this._referrer.isSome();
  }

  /**
   * Whether the name computation is descending into a subtree.
   */
  public get isDescending(): boolean {
    return this._isDescending;
  }

  public hasVisited(element: Element): boolean {
    return this._visited.includes(element);
  }

  public visit(element: Element): State {
    if (this._visited.includes(element)) {
      return this;
    }

    return new State(
      [...this._visited, element],
      this._referrer,
      this._referred,
      this._isRecursing,
      this._isDescending,
    );
  }

  public recurse(isRecursing: boolean): State {
    if (this._isRecursing === isRecursing) {
      return this;
    }

    return new State(
      this._visited,
      this._referrer,
      this._referred,
      isRecursing,
      this._isDescending,
    );
  }

  /**
   * @remarks
   * This set both _referrer and _referred, so that they will always be
   * either both Some or both None.
   *
   * @remarks
   * We currently have no way to clear references since we currently have no
   * use for it.
   *
   * @param referrer The element that is source of a labelled-by relation,
   * e.g. an <input> element or an element with an aria-labelledby attribute.
   *
   * @param referred The element that is target of a labelled-by relation,
   * e.g. a <label> element or an element referenced by an aria-labelled-by attribute
   * on some other element.
   */
  public reference(referrer: Element, referred: Element): State {
    if (
      this._referrer.includes(referrer) &&
      this._referred.includes(referred)
    ) {
      return this;
    }

    return new State(
      this._visited,
      Option.of(referrer),
      Option.of(referred),
      this._isRecursing,
      this._isDescending,
    );
  }

  public descend(isDescending: boolean): State {
    if (this._isDescending === isDescending) {
      return this;
    }

    return new State(
      this._visited,
      this._referrer,
      this._referred,
      this._isRecursing,
      isDescending,
    );
  }

  public equals(state: State): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof State &&
      Array.equals(value._visited, this._visited) &&
      value._referrer.equals(this._referrer) &&
      value._referred.equals(this._referred) &&
      value._isRecursing === this._isRecursing &&
      value._isDescending === this._isDescending
    );
  }

  public toJSON(): State.JSON {
    return {
      visited: this._visited.map((element) => element.path()),
      referrer: this._referrer.map((element) => element.path()).getOr(null),
      referred: this._referred.map((element) => element.path()).getOr(null),
      isRecursing: this._isRecursing,
      isDescending: this._isDescending,
    };
  }
}

/**
 * @internal
 */
export namespace State {
  export interface JSON {
    [key: string]: json.JSON;
    visited: Array<string>;
    referrer: string | null;
    referred: string | null;
    isRecursing: boolean;
    isDescending: boolean;
  }
}
