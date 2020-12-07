import { Keyword } from "../keyword";
import { Length } from "../length";
import { Percentage } from "../percentage";

/**
 * @see https://drafts.csswg.org/css-shapes/#typedef-shape-radius
 */
export class Radius<
  R extends Length | Percentage | Radius.Side =
    | Length
    | Percentage
    | Radius.Side
> {
  public static of<R extends Length | Percentage | Radius.Side>(
    value: R
  ): Radius<R> {
    return new Radius(value);
  }

  private readonly _value: R;

  private constructor(value: R) {
    this._value = value;
  }

  public get value(): R {
    return this._value;
  }
}

export namespace Radius {
  export type Side = Side.Closest | Side.Farthest;

  export namespace Side {
    /**
     * @see https://drafts.csswg.org/css-shapes/#closest-side
     */
    export type Closest = Keyword<"closest-side">;

    /**
     * @see https://drafts.csswg.org/css-shapes/#farthest-side
     */
    export type Farthest = Keyword<"farthest-side">;
  }
}
