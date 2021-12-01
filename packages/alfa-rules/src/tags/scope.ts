import { Tag } from "@siteimprove/alfa-act";

/**
 * @public
 */
export class Scope<S extends string = string> extends Tag<"scope"> {
  public static of<S extends string>(scope: S): Scope<S> {
    return new Scope(scope);
  }

  private readonly _scope: S;

  private constructor(scope: S) {
    super();
    this._scope = scope;
  }

  public get type(): "scope" {
    return "scope";
  }

  public get scope(): S {
    return this._scope;
  }

  public equals(value: Scope): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Scope && value._scope === this._scope;
  }

  public toJSON(): Scope.JSON<S> {
    return {
      ...super.toJSON(),
      scope: this._scope,
    };
  }
}

/**
 * @public
 */
export namespace Scope {
  export interface JSON<S extends string = string> extends Tag.JSON<"scope"> {
    scope: S;
  }

  /**
   * For rules that test failures at the page level. These rules only make sense
   * to include in an audit if an entire page is available.
   */
  export const Page = Scope.of("page");

  /**
   * For rules that test failures at the component level. These rules only make
   * sense to include in an audit if at least an entire component is available.
   */
  export const Component = Scope.of("component");
}
