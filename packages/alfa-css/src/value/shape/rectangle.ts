import { Length } from "../length";
import { Keyword } from "../keyword";

/**
 * @see https://drafts.fxtf.org/css-masking/#funcdef-clip-rect
 * @deprecated
 */
export class Rectangle<O extends Length | Rectangle.Auto> {
  public static of<O extends Length | Rectangle.Auto = Length | Rectangle.Auto>(
    offset: readonly [O, O, O, O]
  ): Rectangle<O> {
    return new Rectangle(offset);
  }

  private readonly _offset: readonly [O, O, O, O];

  private constructor(offset: readonly [O, O, O, O]) {
    this._offset = offset;
  }

  public get offset(): readonly [O, O, O, O] {
    return this._offset;
  }
}

export namespace Rectangle {
  export type Auto = Keyword<"auto">;
}
