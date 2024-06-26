import { Unit } from "../../unit/index.js";

import { Numeric } from "./numeric.js";

/**
 * {@link https://drafts.csswg.org/css-values/#dimensions}
 *
 * @public
 */
export abstract class Dimension<
  T extends Numeric.Dimension = Numeric.Dimension,
  // The actual unit in which the dimension is expressed, e.g px, em, rad, …
  U extends Dimension.ToUnit[T] = Dimension.ToUnit[T],
> extends Numeric<T> {
  protected readonly _unit: U;

  protected constructor(value: number, unit: U, type: T) {
    super(value, type);
    this._unit = unit;
  }

  public get unit(): U {
    return this._unit;
  }

  public hasUnit<V extends Dimension.ToUnit[T]>(
    unit: V,
  ): this is Dimension<T, V> {
    return (this._unit as Dimension.ToUnit[T]) === unit;
  }

  public abstract withUnit<V extends Dimension.ToUnit[T]>(
    unit: V,
  ): Dimension<T, V>;

  public equals(value: unknown): value is this {
    return (
      value instanceof Dimension &&
      super.equals(value) &&
      value._unit === this._unit
    );
  }

  public toJSON(): Dimension.JSON<T, U> {
    return { ...super.toJSON(), unit: this._unit };
  }
}

/**
 * @public
 */
export namespace Dimension {
  export interface JSON<
    T extends Numeric.Dimension = Numeric.Dimension,
    U extends ToUnit[T] = ToUnit[T],
  > extends Numeric.JSON<T> {
    unit: U;
  }

  export function isDimension(value: unknown): value is Dimension {
    return value instanceof Dimension;
  }

  /**
   * Helper type to infer Unit sub-type based on its string representation.
   *
   * @remarks
   * This could probably be factored in within Unit themselves, which would need
   * to rearrange how Unit are built (i.e. not keep them as union of strings).
   *
   * @internal
   */
  export type ToUnit = { angle: Unit.Angle; length: Unit.Length };
}
