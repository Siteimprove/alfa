import { Tag } from "@siteimprove/alfa-act";

/**
 * @public
 */
export class Experimental<
  E extends boolean = boolean
> extends Tag<"experimental"> {
  public static of<E extends boolean>(experimental: E): Experimental<E> {
    return new Experimental(experimental);
  }

  private readonly _experimental: E;

  private constructor(experimental: E) {
    super();
    this._experimental = experimental;
  }

  public get type(): "experimental" {
    return "experimental";
  }

  public get experimental(): E {
    return this._experimental;
  }

  public equals(value: Experimental): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Experimental &&
      value._experimental === this._experimental
    );
  }

  public toJSON(): Experimental.JSON<E> {
    return {
      ...super.toJSON(),
      experimental: this._experimental,
    };
  }
}

/**
 * @public
 */
export namespace Experimental {
  export interface JSON<E extends boolean = boolean>
    extends Tag.JSON<"experimental"> {
    experimental: E;
  }

  /**
   * For experimental rules. These rules are not necessarily compatible with
   * downstream data processing, and are subject to breaking changes without
   * ntocie
   */
  export const Unstable = Experimental.of(true);

  /**
   * For stable rules. These rules follow the same basic principles and are
   * reasonably stable; their changes are tracked by normal semver numbering.
   */
  export const Stable = Experimental.of(false);
}
