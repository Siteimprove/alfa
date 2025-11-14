import { Number, Percentage } from "../numeric/index.js";
import { Format } from "./format.js";

/**
 * Format for colors defined by a functional triplet with an optional alpha
 * channel.
 *
 * @internal
 */
export abstract class Triplet<
  F extends string = string,
  A extends Number.Canonical | Percentage.Canonical =
    | Number.Canonical
    | Percentage.Canonical,
> extends Format<F> {
  protected readonly _alpha: A;

  protected constructor(format: F, alpha: A) {
    super(format);

    this._alpha = alpha;
  }

  public get alpha(): A {
    return this._alpha;
  }

  public toJSON(): Triplet.JSON<F> {
    return {
      ...super.toJSON(),
      alpha: this._alpha.toJSON(),
    };
  }
}

/**
 * @internal
 */
export namespace Triplet {
  export interface JSON<F extends string = string> extends Format.JSON<F> {
    alpha: Number.Fixed.JSON | Percentage.Fixed.JSON;
  }
}
