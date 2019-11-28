import { Unit } from "./unit";

/**
 * @see https://drafts.csswg.org/css-values/#lengths
 */
export class Length<U extends Unit.Length = Unit.Length> {
  public static of<U extends Unit.Length>(value: number, unit: U): Length<U> {
    return new Length(value, unit);
  }

  public readonly value: number;
  public readonly unit: U;

  private constructor(value: number, unit: U) {
    this.value = value;
    this.unit = unit;
  }
}

export namespace Length {
  export function isLength(value: unknown): value is Length {
    return value instanceof Length;
  }
}
