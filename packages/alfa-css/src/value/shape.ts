import { Hash } from "@siteimprove/alfa-hash";

import { Keyword } from "./keyword";
import { Value } from "../value";

import { Circle } from "./shape/circle";
import { Inset } from "./shape/inset";
import { Rectangle } from "./shape/rectangle";
import { Ellipse } from "./shape/ellipse";
import { Polygon } from "./shape/polygon";

export class Shape<
  S extends Shape.Basic = Shape.Basic,
  B extends Shape.Box = Shape.Box
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

  public equals(value: Shape): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Shape &&
      value._shape.equals(this._shape) &&
      value._box.equals(this._box)
    );
  }

  public hash(hash: Hash) {
    this._shape.hash(hash);
    this._box.hash(hash);
  }

  public toJSON(): Shape.JSON {
    return {
      type: "shape",
      shape: this._shape.toJSON(),
      box: this._box.toJSON(),
    };
  }

  public toString(): string {
    return `${this._shape.toString()} ${this._box.toString()}`;
  }
}

export namespace Shape {
  /**
   * @see https://drafts.csswg.org/css-shapes/#supported-basic-shapes
   */
  export type Basic = Circle | Ellipse | Inset | Polygon | Rectangle;

  /**
   * @see https://drafts.csswg.org/css-shapes/#shapes-from-box-values
   */
  export type Box =
    | Keyword<"border-box">
    | Keyword<"padding-box">
    | Keyword<"content-box">
    | Keyword<"margin-box">;

  export interface JSON extends Value.JSON<"shape"> {
    shape:
      | Circle.JSON
      | Ellipse.JSON
      | Inset.JSON
      | Polygon.JSON
      | Rectangle.JSON;
    box: Keyword.JSON;
  }
}
