import { Tag } from "@siteimprove/alfa-act";

/**
 * @public
 */
export class Stability<S extends string = string> extends Tag<"stability"> {
  public static of<S extends string>(stability: S): Stability<S> {
    return new Stability(stability);
  }

  private readonly _stability: S;

  private constructor(stability: S) {
    super();
    this._stability = stability;
  }

  public get type(): "stability" {
    return "stability";
  }

  public get stability(): S {
    return this._stability;
  }

  public equals(value: Stability): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Stability && value._stability === this._stability;
  }

  public toJSON(): Stability.JSON<S> {
    return {
      ...super.toJSON(),
      stability: this._stability,
    };
  }
}

/**
 * @public
 */
export namespace Stability {
  export interface JSON<S extends string = string>
    extends Tag.JSON<"stability"> {
    stability: S;
  }

  /**
   * For experimental rules. These rules are not necessarily compatible with
   * downstream data processing, and are subject to breaking changes without
   * notice
   */
  export const Experimental = Stability.of("experimental");

  /**
   * For stable rules. These rules follow the same basic principles and are
   * reasonably stable; their changes are tracked by normal semver numbering.
   */
  export const Stable = Stability.of("stable");

  /**
   * For deprecated rules. These rules are deprecated and will be removed
   * permanently after some grace period.
   */
  export const Deprecated = Stability.of("deprecated");
}
