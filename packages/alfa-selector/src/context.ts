import { Cache } from "@siteimprove/alfa-cache";
import type { Element } from "@siteimprove/alfa-dom";
import { Map } from "@siteimprove/alfa-map";

/**
 * @public
 */
export class Context {
  public static of(state: Iterable<[Element, Context.State]>): Context {
    return new Context(Map.from(state));
  }

  private static _empty = new Context(Map.empty());

  public static empty(): Context {
    return this._empty;
  }

  private readonly _state: Map<Element, Context.State>;

  protected constructor(state: Map<Element, Context.State>) {
    this._state = state;
  }

  public isEmpty(): boolean {
    return this._state.isEmpty();
  }

  public hasState(element: Element, state: Context.State): boolean {
    return this._state.get(element).some((found) => (found & state) !== 0);
  }

  public getState(element: Element): Context.State {
    return this._state.get(element).getOr(Context.State.None);
  }

  public setState(element: Element, state: Context.State): Context {
    return new Context(this._state.set(element, state));
  }

  public addState(element: Element, state: Context.State): Context {
    return this.setState(element, this.getState(element) | state);
  }

  public *withState(state: Context.State): Iterable<Element> {
    yield* this._state.filter((found) => (found & state) !== 0).keys();
  }

  public hover(element: Element): Context {
    return this.addState(element, Context.State.Hover);
  }

  private static _hovered = Cache.empty<Element, Context>();

  /**
   * @remarks
   * Interned per element: repeated calls for the same element return the
   * same instance, so downstream `Cache<Context, _>` lookups (e.g. in
   * `Cascade`/`Style`) can actually hit across separate call sites querying
   * the same single-element context instead of always missing on a fresh
   * object.
   */
  public static hover(element: Element): Context {
    return this._hovered.get(element, () => this.empty().hover(element));
  }

  public isHovered(element: Element): boolean {
    return this.hasState(element, Context.State.Hover);
  }

  public active(element: Element): Context {
    return this.addState(element, Context.State.Active);
  }

  private static _activated = Cache.empty<Element, Context>();

  public static active(element: Element): Context {
    return this._activated.get(element, () => this.empty().active(element));
  }

  public isActive(element: Element): boolean {
    return this.hasState(element, Context.State.Active);
  }

  public focus(element: Element): Context {
    return this.addState(element, Context.State.Focus);
  }

  private static _focused = Cache.empty<Element, Context>();

  public static focus(element: Element): Context {
    return this._focused.get(element, () => this.empty().focus(element));
  }

  public isFocused(element: Element): boolean {
    return this.hasState(element, Context.State.Focus);
  }

  public visit(element: Element): Context {
    return this.addState(element, Context.State.Visited);
  }

  private static _visited = Cache.empty<Element, Context>();

  public static visit(element: Element): Context {
    return this._visited.get(element, () => this.empty().visit(element));
  }

  public isVisited(element: Element): boolean {
    return this.hasState(element, Context.State.Visited);
  }
}

/**
 * @public
 */
export namespace Context {
  export enum State {
    None = 0,
    Hover = 1,
    Active = 1 << 1,
    Focus = 1 << 2,
    Visited = 1 << 3,
  }
}
