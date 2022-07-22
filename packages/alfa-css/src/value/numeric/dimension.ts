import { Comparable, Comparison } from "@siteimprove/alfa-comparable";

import { Convertible } from "../unit/converter";
import { Numeric } from "./numeric";
import { Unit } from "../unit/unit";

/**
 * {@link https://drafts.csswg.org/css-values/#dimensions}
 *
 * @public
 */
export abstract class Dimension<
    T extends string = string,
    U extends Unit = Unit,
    V extends U = U
  >
  extends Numeric<T>
  implements Convertible<U>, Comparable<Dimension<T, U>>
{
  protected readonly _unit: V;

  protected constructor(value: number, unit: V) {
    super(value);
    this._unit = unit;
  }

  public get unit(): V {
    return this._unit;
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#canonical-unit}
   */
  public abstract get canonicalUnit(): U;

  public hasUnit<V extends U>(unit: V): this is Dimension<T, U, V> {
    return (this._unit as U) === unit;
  }

  public abstract withUnit<V extends U>(unit: V): Dimension<T, U, V>;

  public equals(value: unknown): value is this {
    return (
      value instanceof Dimension &&
      super.equals(value) &&
      value._unit === this._unit
    );
  }

  public compare(value: Dimension<T, U>): Comparison {
    const a = this.withUnit(this.canonicalUnit);
    const b = value.withUnit(value.canonicalUnit);

    return Comparable.compareNumber(a.value, b.value);
  }
}

/**
 * @public
 */
export namespace Dimension {
  export interface JSON<T extends string = string> extends Numeric.JSON<T> {
    unit: Unit;
  }

  export function isDimension(value: unknown): value is Dimension {
    return value instanceof Dimension;
  }
}
