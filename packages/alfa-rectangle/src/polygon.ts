import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Array } from "@siteimprove/alfa-array";

import type * as json from "@siteimprove/alfa-json";

import { Rectangle } from "./rectangle.js";

/**
 * {@link https://en.wikipedia.org/wiki/Rectilinear_polygon}
 *
 * A polygon represented as collections of non-overlapping rectangles.
 *
 * @public
 */
export class Polygon implements Equatable, Hashable {
  /**
   * Assumes rectangles are non-overlapping. If not, use `add`.
   */
  static of(rectangles: Array<Rectangle>): Polygon {
    return new Polygon(rectangles);
  }

  static empty(): Polygon {
    return new Polygon([]);
  }

  rectangles: Array<Rectangle>;

  constructor(rectangles: Array<Rectangle>) {
    // Create a copy of the array for merging
    this.rectangles = [...rectangles];
    this.merge();
  }

  /**
   * Adds a rectangle by first removing overlaps.
   * Mutates the internal state of the Polygon and returns the same instance.
   */
  add(rectangle: Rectangle): Polygon {
    this.subtract(rectangle);
    this.rectangles.push(rectangle);

    this.merge();

    return this;
  }

  /**
   * Subtracts a rectangle from a polygon.
   * Mutates the internal state of the Polygon and returns the same instance.
   */
  subtract(rectangle: Rectangle): Polygon {
    const result: Array<Rectangle> = [];

    for (const rect of this.rectangles) {
      result.push(...rect.subtract(rectangle).rectangles);
    }

    this.rectangles = result;

    return this;
  }

  merge() {
    while (mergeRectangles(this.rectangles)) {}
  }

  get boundingRectangle() {
    return Rectangle.union(...this.rectangles);
  }

  rasterize(): { grid: Array<Array<boolean>>; width: number; height: number } {
    const boundingRectangle = this.boundingRectangle;
    const minX = Math.floor(boundingRectangle.left);
    const minY = Math.floor(boundingRectangle.top);
    const maxX = Math.ceil(boundingRectangle.right);
    const maxY = Math.ceil(boundingRectangle.bottom);

    const width = maxX - minX;
    const height = maxY - minY;

    const grid = globalThis.Array.from({ length: height }, () =>
      globalThis.Array(width).fill(false),
    );

    for (const r of this.rectangles) {
      const startX = Math.floor(r.left) - minX;
      const startY = Math.floor(r.top) - minY;
      const endX = Math.ceil(r.right) - minX;
      const endY = Math.ceil(r.bottom) - minY;

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          grid[y][x] = true;
        }
      }
    }

    return { grid, width, height };
  }

  /**
   * Checks if the polygon can fit a square of a given size.
   * Rasterizes the polygon and uses a 2D prefix sum for efficient checking.
   */
  canFitSquare(size: number): boolean {
    const { grid, width, height } = this.rasterize();

    const psum = globalThis.Array.from({ length: height + 1 }, () =>
      globalThis.Array(width + 1).fill(0),
    );

    // Computes the 2D prefix sum.
    // This is a grid that at psum[y][x] stores count of cells from the top left corner
    // of the rasterization grid to (x-1, y-1) that lie within the polygon.
    for (let y = 1; y <= height; ++y) {
      for (let x = 1; x <= width; ++x) {
        psum[y][x] =
          grid[y - 1][x - 1] + // Current cell
          psum[y - 1][x] + // Plus count of above and left
          psum[y][x - 1] - // Plus count of left and above
          psum[y - 1][x - 1]; // Minus count of top-left corner which was added in both previous additions
      }
    }

    // Loop over all cells in the rasterization grid and count the number of cells
    // in a size x size square that lie inside the grid using the prefix sum.
    // The number corresponds to the area of the intersection of the square and the polygon
    // and if that equals the total area of the square, it means that the square fits inside the polygon.
    for (let y = 0; y <= height - size; ++y) {
      for (let x = 0; x <= width - size; ++x) {
        const left = x;
        const top = y;
        const right = x + size;
        const bottom = y + size;
        const cellsInPolygon =
          psum[bottom][right] -
          psum[top][right] -
          psum[bottom][left] +
          psum[top][left];
        if (cellsInPolygon === size * size) return true;
      }
    }

    return false;
  }

  equals(value: this): boolean;
  equals(value: unknown): value is this;
  equals(value: unknown): boolean {
    return (
      value === this ||
      (value instanceof Polygon &&
        Array.equals(value.rectangles, this.rectangles))
    );
  }

  hash(hash: Hash): void {
    Array.hash(this.rectangles, hash);
  }

  toJSON(): Polygon.JSON {
    return {
      type: "polygon",
      rectangles: this.rectangles.map((rect) => rect.toJSON()),
    };
  }
}

export namespace Polygon {
  export type JSON = {
    [key: string]: json.JSON;
    type: "polygon";
    rectangles: Array<Rectangle.JSON>;
  };

  export function from(json: Polygon.JSON) {
    return Polygon.of(json.rectangles.map(Rectangle.from));
  }

  export function isPolygon(value: unknown): value is Polygon {
    return value instanceof Polygon;
  }
}

/**
 * Mutates the input array.
 * Returns true if two rectangles were merged, otherwise false.
 */
function mergeRectangles(rectangles: Array<Rectangle>): boolean {
  for (let i = 0; i < rectangles.length; ++i) {
    for (let j = i + 1; j < rectangles.length; ++j) {
      if (tryMerge(i, j, rectangles)) return true;
    }
  }
  return false;
}

function tryMerge(i: number, j: number, rectangles: Array<Rectangle>): boolean {
  const a = rectangles[i];
  const b = rectangles[j];

  // Horizontal merge
  if (closeEnough(a.top, b.top) && closeEnough(a.bottom, b.bottom)) {
    if (closeEnough(a.right, b.left) || closeEnough(b.right, a.left)) {
      rectangles[i] = Rectangle.fromCorners(
        Math.min(a.left, b.left),
        a.top,
        Math.max(a.right, b.right),
        a.bottom,
      );
      rectangles.splice(j, 1);
      return true;
    }
  }

  // Vertical merge
  if (closeEnough(a.left, b.left) && closeEnough(a.right, b.right)) {
    if (closeEnough(a.bottom, b.top) || closeEnough(b.bottom, a.top)) {
      rectangles[i] = Rectangle.fromCorners(
        a.left,
        Math.min(a.top, b.top),
        a.right,
        Math.max(a.bottom, b.bottom),
      );
      rectangles.splice(j, 1);
      return true;
    }
  }

  return false;
}

function closeEnough(a: number, b: number, epsilon = 0.1): boolean {
  return Math.abs(a - b) < epsilon;
}
