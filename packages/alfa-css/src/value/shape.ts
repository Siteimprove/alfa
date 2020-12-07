import { Value } from "../value";

import { Keyword } from "./keyword";

import { Circle } from "./shape/circle";
import { Inset } from "./shape/inset";

export class Shape<
  S extends Shape.Basic = Shape.Basic,
  B = Shape.Box
> extends Value<"shape"> {
  private readonly _shape: S;
  private readonly _box: B;

  private constructor(shape: S, box: B) {
    super();
    this._shape = shape;
    this._box = box;
  }

  public get type(): "shape" {
    return "shape";
  }

  public get shape(): S {
    return this._shape;
  }

  public get box(): B {
    return this._box;
  }
}

export namespace Shape {
  /**
   * @see https://drafts.csswg.org/css-shapes/#supported-basic-shapes
   */
  export type Basic = Circle | Inset;

  /**
   * @see https://drafts.csswg.org/css-shapes/#shapes-from-box-values
   */
  export type Box =
    | Keyword<"border-box">
    | Keyword<"padding-box">
    | Keyword<"content-box">
    | Keyword<"margin-box">;
}
