import { Convertible } from "./converter";
import { Numeric } from "./numeric";
import { Unit } from "./unit";

/**
 * @see https://drafts.csswg.org/css-values/#dimensions
 */
export abstract class Dimension<
    T extends string = string,
    U extends Unit = Unit,
    V extends U = U
  >
  extends Numeric<T>
  implements Convertible<U> {
  protected readonly _unit: V;

  protected constructor(value: number, unit: V) {
    super(value);

    this._unit = unit;
  }

  public get unit(): V {
    return this._unit;
  }

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
}

export namespace Dimension {
  export interface JSON extends Numeric.JSON {
    unit: Unit;
  }

  export function isDimension(value: unknown): value is Dimension {
    return value instanceof Dimension;
  }
}
