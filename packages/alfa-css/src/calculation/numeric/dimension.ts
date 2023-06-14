import { Comparable, Comparison } from "@siteimprove/alfa-comparable";

import { Convertible, Unit } from "../../unit";

import { Numeric } from "./numeric";

type ToDimension<T extends Numeric.Dimension> = T extends "length"
  ? Unit.Length
  : T extends "angle"
  ? Unit.Angle
  : // We currently do not really support other dimensions
    Unit;

/**
 * {@link https://drafts.csswg.org/css-values/#dimensions}
 *
 * @public
 */
export abstract class Dimension<
    T extends Numeric.Dimension = Numeric.Dimension,
    // The actual unit in which the dimension is expressed, e.g px, em, rad, …
    V extends ToDimension<T> = ToDimension<T>
  >
  extends Numeric<T>
  implements Convertible<ToDimension<T>>, Comparable<Dimension<T>>
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
  public abstract get canonicalUnit(): ToDimension<T>;

  public hasUnit<V extends ToDimension<T>>(unit: V): this is Dimension<T, V> {
    return (this._unit as ToDimension<T>) === unit;
  }

  public abstract withUnit<V extends ToDimension<T>>(unit: V): Dimension<T, V>;

  public equals(value: unknown): value is this {
    return (
      value instanceof Dimension &&
      super.equals(value) &&
      value._unit === this._unit
    );
  }

  public compare(value: Dimension<T>): Comparison {
    const a = this.withUnit(this.canonicalUnit);
    const b = value.withUnit(value.canonicalUnit);

    return Comparable.compareNumber(a.value, b.value);
  }

  public toJSON(): Dimension.JSON<T, V> {
    return { ...super.toJSON(), unit: this._unit };
  }
}

/**
 * @public
 */
export namespace Dimension {
  export interface JSON<
    T extends Numeric.Dimension = Numeric.Dimension,
    U extends ToDimension<T> = ToDimension<T>
  > extends Numeric.JSON<T> {
    unit: U;
  }

  export function isDimension(value: unknown): value is Dimension {
    return value instanceof Dimension;
  }
}
