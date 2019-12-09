import { Convert, Convertible } from "./convert";
import { Unit } from "./unit";

/**
 * @see https://drafts.csswg.org/css-values/#lengths
 */
export abstract class Length<U extends Unit.Length = Unit.Length> {
  public readonly value: number;
  public readonly unit: U;

  protected constructor(value: number, unit: U) {
    this.value = value;
    this.unit = unit;
  }

  public hasUnit<U extends Unit.Length>(unit: U): this is Length<U> {
    return (this.unit as Unit.Length) === unit;
  }

  public abstract isRelative(): this is Length.Relative<
    Extract<U, Unit.Length.Relative>
  >;

  public abstract isAbsolute(): this is Length.Absolute<
    Extract<U, Unit.Length.Absolute>
  >;
}

export namespace Length {
  export function isLength(value: unknown): value is Length {
    return value instanceof Length;
  }

  /**
   * @see https://drafts.csswg.org/css-values/#relative-lengths
   */
  export class Relative<
    U extends Unit.Length.Relative = Unit.Length.Relative
  > extends Length<U> {
    public static of<U extends Unit.Length.Relative>(
      value: number,
      unit: U
    ): Relative<U> {
      return new Relative(value, unit);
    }

    private constructor(value: number, unit: U) {
      super(value, unit);
    }

    public isRelative(): boolean {
      return true;
    }

    public isAbsolute(): boolean {
      return false;
    }
  }

  /**
   * @see https://drafts.csswg.org/css-values/#absolute-lengths
   */
  export class Absolute<U extends Unit.Length.Absolute = Unit.Length.Absolute>
    extends Length<U>
    implements Convertible<Unit.Length.Absolute> {
    public static of<U extends Unit.Length.Absolute>(
      value: number,
      unit: U
    ): Absolute<U> {
      return new Absolute(value, unit);
    }

    private constructor(value: number, unit: U) {
      super(value, unit);
    }

    public isRelative(): boolean {
      return false;
    }

    public isAbsolute(): boolean {
      return true;
    }

    public withUnit<U extends Unit.Length.Absolute>(unit: U): Absolute<U> {
      if (this.hasUnit(unit)) {
        return this;
      }

      return new Absolute(Convert.length(this.value, this.unit, unit), unit);
    }
  }
}
