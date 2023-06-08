import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

const { max, min } = Math;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMRect}
 *
 * @public
 */
export class Rectangle
  implements Equatable, Hashable, Serializable<Rectangle.JSON>
{
  public static of(
    x: number,
    y: number,
    width: number,
    height: number
  ): Rectangle {
    return new Rectangle(x, y, width, height);
  }

  private readonly _x: number;
  private readonly _y: number;
  private readonly _width: number;
  private readonly _height: number;

  private constructor(x: number, y: number, width: number, height: number) {
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
  }

  public get x(): number {
    return this._x;
  }

  public get y(): number {
    return this._y;
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public get top(): number {
    return this._height > 0 ? this._y : this._y + this._height;
  }

  public get right(): number {
    return this._width > 0 ? this._x + this._width : this._x;
  }

  public get bottom(): number {
    return this._height > 0 ? this._y + this._height : this._y;
  }

  public get left(): number {
    return this._width > 0 ? this._x : this._x + this._width;
  }

  public get center(): { x: number; y: number } {
    return {
      x: this._x + this._width / 2,
      y: this._y + this._height / 2,
    };
  }

  public get area(): number {
    return this._width * this._height;
  }

  public contains(other: Rectangle): boolean {
    return (
      this.left <= other.left &&
      this.top <= other.top &&
      other.right <= this.right &&
      other.bottom <= this.bottom
    );
  }

  public intersects(other: Rectangle) {
    return (
      other.left <= this.right &&
      other.top <= this.bottom &&
      other.right >= this.left &&
      other.bottom >= this.top
    );
  }

  public equals(value: this): boolean;
  public equals(value: unknown): value is this;
  public equals(value: unknown): boolean {
    return (
      value === this ||
      (value instanceof Rectangle &&
        value.top === this.top &&
        value.left === this.left &&
        value.width === this.width &&
        value.height === this.height)
    );
  }

  public hash(hash: Hash): void {
    hash
      .writeNumber(this._x)
      .writeNumber(this._y)
      .writeNumber(this._width)
      .writeNumber(this._height);
  }

  public toJSON(): Rectangle.JSON {
    return {
      type: "rectangle",
      x: this._x,
      y: this._y,
      width: this._width,
      height: this._height,
    };
  }
}

/**
 * @public
 */
export namespace Rectangle {
  export type JSON = {
    [key: string]: json.JSON;
    type: "rectangle";
    x: number;
    y: number;
    width: number;
    height: number;
  };

  export function from(json: Rectangle.JSON) {
    return Rectangle.of(json.x, json.y, json.width, json.height);
  }

  export function isRectangle(value: unknown): value is Rectangle {
    return value instanceof Rectangle;
  }

  export function union(...rectangles: Array<Rectangle>): Rectangle {
    let l = Infinity;
    let t = Infinity;
    let r = -Infinity;
    let b = -Infinity;

    for (const rectangle of rectangles) {
      l = min(l, rectangle.left);
      t = min(t, rectangle.top);
      r = max(r, rectangle.right);
      b = max(b, rectangle.bottom);
    }

    return Rectangle.of(l, t, r - l, b - t);
  }
}
