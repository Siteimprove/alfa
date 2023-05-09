import { Comparable, Comparison } from "@siteimprove/alfa-comparable";

import { Numeric2 } from "./numeric2";
import { Convertible, Unit } from "../../unit";

/**
 * {@link https://drafts.csswg.org/css-values/#dimensions}
 *
 * @public
 */
export abstract class Dimension2<
    T extends Numeric2.Dimension = Numeric2.Dimension,
    // The type of all units of the same dimension, e.g. Length, Angle, …
    U extends Unit = Unit,
    // The actual unit in which the dimension is expressed, e.g px, em, rad, …
    V extends U = U
  >
  extends Numeric2<T>
  implements Convertible<U>, Comparable<Dimension2<T, U>>
{
  protected readonly _unit: V;

  protected constructor(value: number, unit: V, type: T) {
    super(value, type);
    this._unit = unit;
  }

  public get unit(): V {
    return this._unit;
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#canonical-unit}
   */
  public abstract get canonicalUnit(): U;

  public hasUnit<V extends U>(unit: V): this is Dimension2<T, U, V> {
    return (this._unit as U) === unit;
  }

  public abstract withUnit<V extends U>(unit: V): Dimension2<T, U, V>;

  public equals(value: unknown): value is this {
    return (
      value instanceof Dimension2 &&
      super.equals(value) &&
      value._unit === this._unit
    );
  }

  public compare(value: Dimension2<T, U>): Comparison {
    const a = this.withUnit(this.canonicalUnit);
    const b = value.withUnit(value.canonicalUnit);

    return Comparable.compareNumber(a.value, b.value);
  }

  public toJSON(): Dimension2.JSON<T, V> {
    return { ...super.toJSON(), unit: this._unit };
  }
}

/**
 * @public
 */
export namespace Dimension2 {
  export interface JSON<
    T extends Numeric2.Dimension = Numeric2.Dimension,
    U extends Unit = Unit
  > extends Numeric2.JSON<T> {
    unit: U;
  }

  export function isDimension(value: unknown): value is Dimension2 {
    return value instanceof Dimension2;
  }
}
