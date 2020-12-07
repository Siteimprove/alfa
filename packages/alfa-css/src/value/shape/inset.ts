import { Length } from "../length";
import { Percentage } from "../percentage";

/**
 * @see https://drafts.csswg.org/css-shapes/#funcdef-inset
 */
export class Inset<
  O extends Length | Percentage = Length | Percentage,
  R extends Length | Percentage = Length | Percentage
> {
  public static of<
    O extends Length | Percentage = Length | Percentage,
    R extends Length | Percentage = Length | Percentage
  >(offset: readonly [O, O, O, O], radius: readonly [R, R, R, R]): Inset<O, R> {
    return new Inset(offset, radius);
  }

  private readonly _offset: readonly [O, O, O, O];
  private readonly _radius: readonly [R, R, R, R];

  private constructor(
    offset: readonly [O, O, O, O],
    radius: readonly [R, R, R, R]
  ) {
    this._offset = offset;
    this._radius = radius;
  }

  public get offset(): readonly [O, O, O, O] {
    return this._offset;
  }

  public get radius(): readonly [R, R, R, R] {
    return this._radius;
  }
}
