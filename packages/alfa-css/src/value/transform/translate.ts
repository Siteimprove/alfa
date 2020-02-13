import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

import { Length } from "../length";
import { Percentage } from "../percentage";

export class Translate<
  X extends Length | Percentage = Length | Percentage,
  Y extends Length | Percentage = Length | Percentage,
  Z extends Length = Length
> implements Equatable, Serializable {
  public static of<
    X extends Length | Percentage,
    Y extends Length | Percentage,
    Z extends Length
  >(x: X, y: Y, z: Z): Translate<X, Y, Z> {
    return new Translate(x, y, z);
  }

  private readonly _x: X;
  private readonly _y: Y;
  private readonly _z: Z;

  private constructor(x: X, y: Y, z: Z) {
    this._x = x;
    this._y = y;
    this._z = z;
  }

  public get x(): X {
    return this._x;
  }

  public get y(): Y {
    return this._y;
  }

  public get z(): Z {
    return this._z;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Translate &&
      value._x.equals(this._x) &&
      value._y.equals(this._y) &&
      value._z.equals(this._z)
    );
  }

  public toJSON(): Translate.JSON {
    return {
      type: "translate",
      x: this._x.toJSON(),
      y: this._y.toJSON(),
      z: this._z.toJSON()
    };
  }

  public toString(): string {
    if (this._z.value === 0) {
      return `translate(${this._x}${
        this._y.value === 0 ? "" : `, ${this._y}`
      })`;
    }

    return `translate3d(${this._x}, ${this._y}, ${this._z})`;
  }
}

export namespace Translate {
  export interface JSON {
    [key: string]: json.JSON;
    type: "translate";
    x: Length.JSON | Percentage.JSON;
    y: Length.JSON | Percentage.JSON;
    z: Length.JSON;
  }
}
