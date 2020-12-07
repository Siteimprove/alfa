import { Position } from "../position";

import { Radius } from "./radius";

/**
 * @see https://drafts.csswg.org/css-shapes/#funcdef-circle
 */
export class Circle<R extends Radius = Radius, P extends Position = Position> {
  public static of<R extends Radius, P extends Position>(
    radius: R,
    position: P
  ): Circle<R, P> {
    return new Circle(radius, position);
  }

  private readonly _radius: R;
  private readonly _position: P;

  private constructor(radius: R, position: P) {
    this._radius = radius;
    this._position = position;
  }

  public get radius(): R {
    return this._radius;
  }

  public get position(): P {
    return this._position;
  }
}
