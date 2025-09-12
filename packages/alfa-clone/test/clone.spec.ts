import { describe, it } from "vitest";

import { Clone } from "../dist/clone.js";

class Point implements Clone<Point> {
  constructor(
    public x: number,
    public y: number,
  ) {}

  clone(): Point {
    return new Point(this.x, this.y);
  }
}

describe("#clone()", () => {
  it("calls clone() on instance of class implementing Clone interface", ({
    expect,
  }) => {
    const point = new Point(3, 5);
    const clonedPoint = Clone.clone(point);

    expect(clonedPoint).not.toBe(point);
    expect(clonedPoint).toEqual(point);
  });
});
