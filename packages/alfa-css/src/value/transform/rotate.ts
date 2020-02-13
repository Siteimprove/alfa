import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

import { Angle } from "../angle";
import { Number } from "../number";

export class Rotate<A extends Angle = Angle>
  implements Equatable, Serializable {
  public static of<A extends Angle>(
    x: Number,
    y: Number,
    z: Number,
    angle: A
  ): Rotate<A> {
    return new Rotate(x, y, z, angle);
  }

  private readonly _x: Number;
  private readonly _y: Number;
  private readonly _z: Number;
  private readonly _angle: A;

  private constructor(x: Number, y: Number, z: Number, angle: A) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._angle = angle;
  }

  public get x(): Number {
    return this._x;
  }

  public get y(): Number {
    return this._y;
  }

  public get z(): Number {
    return this._z;
  }

  public get angle(): A {
    return this._angle;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Rotate &&
      value._x.equals(this._x) &&
      value._y.equals(this._y) &&
      value._z.equals(this._z) &&
      value._angle.equals(this._angle)
    );
  }

  public toJSON(): Rotate.JSON {
    return {
      type: "rotate",
      x: this._x.toJSON(),
      y: this._y.toJSON(),
      z: this._z.toJSON(),
      angle: this._angle.toJSON()
    };
  }

  public toString(): string {
    if (this._x.value === 0 && this._y.value === 0 && this._z.value === 1) {
      return `rotate(${this._angle})`;
    }

    return `rotate3d(${this._x}, ${this._y}, ${this._z}, ${this._angle})`;
  }
}

export namespace Rotate {
  export interface JSON {
    [key: string]: json.JSON;
    type: "rotate";
    x: Number.JSON;
    y: Number.JSON;
    z: Number.JSON;
    angle: Angle.JSON;
  }
}
