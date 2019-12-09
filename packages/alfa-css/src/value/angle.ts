import { Convert, Convertible } from "./convert";
import { Unit } from "./unit";

/**
 * @see https://drafts.csswg.org/css-values/#angles
 */
export class Angle<U extends Unit.Angle = Unit.Angle>
  implements Convertible<Unit.Angle> {
  public static of<U extends Unit.Angle>(value: number, unit: U): Angle<U> {
    return new Angle(value, unit);
  }

  public readonly value: number;
  public readonly unit: U;

  private constructor(value: number, unit: U) {
    this.value = value;
    this.unit = unit;
  }

  public hasUnit<U extends Unit.Angle>(unit: U): this is Angle<U> {
    return (this.unit as Unit.Angle) === unit;
  }

  public withUnit<U extends Unit.Angle>(unit: U): Angle<U> {
    if (this.hasUnit(unit)) {
      return this;
    }

    return new Angle(Convert.angle(this.value, this.unit, unit), unit);
  }
}

export namespace Angle {
  export function isAngle(value: unknown): value is Angle {
    return value instanceof Angle;
  }
}
