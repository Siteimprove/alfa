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

  private static _empty = new Rectangle(Infinity, Infinity, 0, 0);
  public static empty(): Rectangle {
    return this._empty;
  }

  private static _full = new Rectangle(
    -Infinity,
    -Infinity,
    Infinity,
    Infinity
  );
  public static full(): Rectangle {
    return this._full;
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
    // Infinity - Infinity is NaN, but here we want it to be -Infinity
    if (this._y === Infinity && this._height === -Infinity) {
      return -Infinity;
    }

    return this._height > 0 ? this._y : this._y + this._height;
  }

  public get right(): number {
    // -Infinity + Infinity is NaN, but here we want it to be Infinity
    if (this._x === -Infinity && this._width === Infinity) {
      return Infinity;
    }

    return this._width > 0 ? this._x + this._width : this._x;
  }

  public get bottom(): number {
    // -Infinity + Infinity is NaN, but here we want it to be Infinity
    if (this._y === -Infinity && this._height === Infinity) {
      return Infinity;
    }

    return this._height > 0 ? this._y + this._height : this._y;
  }

  public get left(): number {
    // Infinity - Infinity is NaN, but here we want it to be -Infinity
    if (this._x === Infinity && this._width === -Infinity) {
      return -Infinity;
    }

    return this._width > 0 ? this._x : this._x + this._width;
  }

  public get center(): { x: number; y: number } {
    // TODO: How to handle infinite rectangles?
    return {
      x: this._x + this._width / 2,
      y: this._y + this._height / 2,
    };
  }

  public get area(): number {
    return this._width * this._height;
  }

  public isEmpty(): boolean {
    return this.equals(Rectangle.empty());
  }

  public isFull(): boolean {
    return this.equals(Rectangle.full());
  }

  public contains(other: Rectangle): boolean {
    if (other.isEmpty() || this.isFull()) {
      return true;
    }

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

  public union(other: Rectangle): Rectangle {
    if (this.contains(other)) {
      return this;
    }

    if (other.contains(this)) {
      return other;
    }

    const minLeft = min(this.left, other.left);
    const minTop = min(this.top, other.top);
    const maxRight = max(this.right, other.right);
    const maxBottom = max(this.bottom, other.bottom);

    return Rectangle.of(
      minLeft,
      minTop,
      maxRight - minLeft,
      maxBottom - minTop
    );
  }

  public intersection(other: Rectangle): Rectangle {
    if (!this.intersects(other)) {
      return Rectangle.empty();
    }

    if (this.contains(other)) {
      return other;
    }

    if (other.contains(this)) {
      return this;
    }

    const maxLeft = max(this.left, other.left);
    const maxTop = max(this.top, other.top);
    const minRight = min(this.right, other.right);
    const minBottom = min(this.bottom, other.bottom);

    return Rectangle.of(
      maxLeft,
      maxTop,
      minRight - maxLeft,
      minBottom - maxTop
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
        value.bottom === this.bottom &&
        value.right === this.right)
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
    return rectangles.reduce(
      (previous, current) => previous.union(current),
      Rectangle.empty()
    );
  }

  export function intersection(...rectangles: Array<Rectangle>): Rectangle {
    return rectangles.reduce(
      (previous, current) => previous.intersection(current),
      Rectangle.full()
    );
  }
}
