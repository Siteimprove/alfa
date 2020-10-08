import { Element } from "@siteimprove/alfa-dom";
import { Map } from "@siteimprove/alfa-map";

export class Context {
  public static of(state: Iterable<[Element, Context.State]>): Context {
    return new Context(Map.from(state));
  }

  private static _empty = new Context(Map.empty());

  public static empty(): Context {
    return this._empty;
  }

  private readonly _state: Map<Element, Context.State>;

  private constructor(state: Map<Element, Context.State>) {
    this._state = state;
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

  public hover(element: Element): Context {
    return this.setState(element, this.getState(element) | Context.State.Hover);
  }

  public static hover(element: Element): Context {
    return this.empty().hover(element);
  }

  public isHovered(element: Element): boolean {
    return this.hasState(element, Context.State.Hover);
  }

  public active(element: Element): Context {
    return this.setState(
      element,
      this.getState(element) | Context.State.Active
    );
  }

  public static active(element: Element): Context {
    return this.empty().active(element);
  }

  public isActive(element: Element): boolean {
    return this.hasState(element, Context.State.Active);
  }

  public focus(element: Element): Context {
    return this.setState(element, this.getState(element) | Context.State.Focus);
  }

  public static focus(element: Element): Context {
    return this.empty().focus(element);
  }

  public isFocused(element: Element): boolean {
    return this.hasState(element, Context.State.Focus);
  }

  public visit(element: Element): Context {
    return this.setState(
      element,
      this.getState(element) | Context.State.Visited
    );
  }

  public static visit(element: Element): Context {
    return this.empty().visit(element);
  }

  public isVisited(element: Element): boolean {
    return this.hasState(element, Context.State.Visited);
  }
}

export namespace Context {
  export enum State {
    None = 0,
    Hover = 1,
    Active = 1 << 1,
    Focus = 1 << 2,
    Visited = 1 << 3,
  }
}
