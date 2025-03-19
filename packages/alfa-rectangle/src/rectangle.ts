import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Hash, Hashable } from "@siteimprove/alfa-hash";
import type { Serializable } from "@siteimprove/alfa-json";

import type * as json from "@siteimprove/alfa-json";
import { Sequence } from "@siteimprove/alfa-sequence";

const { max, min } = Math;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMRect}
 *
 * @remarks
 * The y axis in the coordinate system on the HTML canvas is inverted so that
 * the y coordinates gets bigger further down the page.
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
    height: number,
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
    Infinity,
  );
  public static full(): Rectangle {
    return this._full;
  }

  private readonly _x: number;
  private readonly _y: number;
  private readonly _width: number;
  private readonly _height: number;

  protected constructor(x: number, y: number, width: number, height: number) {
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

  public intersects(other: Rectangle): boolean {
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
      maxBottom - minTop,
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
      minBottom - maxTop,
    );
  }

  /**
   * Subtracts one or more rectangles. The result is a collection of smaller
   * rectangles covering the part of the original rectangle which didn't overlap
   * the rectangles that was subtracted. The smaller rectangles will have the
   * maximal possible width and height and for each subtraction between 0 and 4
   * smaller rectangles will be produced to cover the difference.
   *
   * In the following example, the rectangles overlap in such a way that the
   * difference will consist of two narrow overlapping rectangles to the right
   * and below, overlapping in the bottom right corner:
   *
   *       +---------------------------------------+
   *       |                                       |
   *       |                                       |
   *       |     +- - - - - - - - - - - - - - - - -+-------+
   *       |     |                                 |\\\\\\\|
   *       |                                       |\\\\\\\|
   *       |     |                                 |\\\\\\\|
   *       |                                       |\\\\\\\|
   *       |     |                                 |\\\\\\\|
   *       |                                       |\\\\\\\|
   *       |     |                                 |\\\\\\\|
   *       |                                       |\\\\\\\|
   *       +-----+---------------------------------+-------+
   *             |/////////////////////////////////|XXXXXXX|
   *             |/////////////////////////////////|XXXXXXX|
   *             +---------------------------------+-------+
   */
  public subtract(...others: Array<Rectangle>): Sequence<Rectangle> {
    let result: Array<Rectangle> = [this];
    for (const other of others) {
      result = result.flatMap((rect) => rect._subtract(other));

      // If the difference becomes empty, there is no need to keep subtracting.
      if (result.length === 0) {
        return Sequence.empty();
      }
    }

    return Sequence.from(result);
  }

  private _subtract(other: Rectangle): Array<Rectangle> {
    if (!this.intersects(other)) {
      return [this];
    }

    const result: Array<Rectangle> = [];

    if (this.top < other.top) {
      result.push(
        Rectangle.of(this.left, this.top, this.width, other.top - this.top),
      );
    }

    if (this.left < other.left) {
      result.push(
        Rectangle.of(this.left, this.top, other.left - this.left, this.height),
      );
    }

    if (other.bottom < this.bottom) {
      result.push(
        Rectangle.of(
          this.left,
          other.bottom,
          this.width,
          this.bottom - other.bottom,
        ),
      );
    }

    if (other.right < this.right) {
      result.push(
        Rectangle.of(
          other.right,
          this.top,
          this.right - other.right,
          this.height,
        ),
      );
    }

    return result;
  }

  /**
   * Checks if the rectangle intersects a given circle.
   *
   * @remarks
   * @see ../docs/circle-rectangle-intersection.png for a visual explanation of the case
   * where the circle center lies in one of the corners of the padded rectangle.
   *
   * @privateRemarks
   * To check intersection, we pad the rectangle by the radius of the circle and divide the problem into three cases:
   *
   * 1. The circle center is outside the padded rectangle.
   * 2. The circle center is inside the padded rectangle, but not in one of the corners.
   * 3. The circle center lies in one of the corners of the padded rectangle in which case we need to compute the distance to the corner
   *
   *                 r
   *              +-------+-------------------------+-------+
   *              |       |                         |       |
   *     1        |       |                         |       |
   *              +-------+-------------------------+-------+
   *              |       |                         |       |
   *              |       |                         |       |
   *              |       |                         |       |
   *              |       |                         |       |
   *              |       |                         |       |
   *              +-------+-------------------------+-------+
   *              |       |            2            |       |
   *              | 3     |                         |       |
   *              +-------+-------------------------+-------+
   */
  public intersectsCircle(cx: number, cy: number, r: number): boolean {
    const center = this.center;
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;

    const dx = Math.abs(cx - center.x);
    const dy = Math.abs(cy - center.y);

    if (dx > halfWidth + r || dy > halfHeight + r) {
      // 1. The circle center is outside the padded rectangle
      return false;
    }

    // The circle center is inside the padded rectangle
    if (dx <= halfWidth || dy <= halfHeight) {
      // 2. The circle lies at most a radius away from the rectangle in the x or y directions
      return true;
    }

    // 3. The circle center lies in one of the corners of the padded rectangle.
    // If the distance from the circle center to the closest corner of the rectangle
    // is less than the radius of the circle, the circle intersects the rectangle.
    return (dx - halfWidth) ** 2 + (dy - halfHeight) ** 2 <= r ** 2;
  }

  /**
   * Computes the squared distance between the centers of two rectangles.
   *
   * @remarks
   * The squared distance is used to avoid the expensive square root operation.
   * If the actual distance is needed, the square root of the squared distance can be taken.
   */
  public distanceSquared(other: Rectangle): number {
    const c1 = this.center;
    const c2 = other.center;
    return (c1.x - c2.x) ** 2 + (c1.y - c2.y) ** 2;
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

  public toString(): string {
    return `Rectangle { x: ${this._x}, y: ${this._y}, width: ${this._width}, height: ${this._height} }`;
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
      Rectangle.empty(),
    );
  }

  export function intersection(...rectangles: Array<Rectangle>): Rectangle {
    return rectangles.reduce(
      (previous, current) => previous.intersection(current),
      Rectangle.full(),
    );
  }
}
