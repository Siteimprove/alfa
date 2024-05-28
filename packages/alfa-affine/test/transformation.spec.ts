import { describe, assert, it } from "vitest";

import { Transformation } from "../src";

describe("#decompose()", () => {
  it("decomposes a translation transformation", () => {
    assert.deepEqual(
      Transformation.translate(10, 20, 30).decompose().getUnsafe(),
      {
        translate: [10, 20, 30],
        scale: [1, 1, 1],
        skew: [0, 0, 0],
        rotate: [0, 0, 0, 1],
        perspective: [0, 0, 0, 1],
      },
    );
  });

  it("decomposes a scaling transformation", () => {
    assert.deepEqual(Transformation.scale(10, 20, 30).decompose().getUnsafe(), {
      translate: [0, 0, 0],
      scale: [10, 20, 30],
      skew: [0, 0, 0],
      rotate: [0, 0, 0, 1],
      perspective: [0, 0, 0, 1],
    });
  });

  it("decomposes a rotation transformation", () => {
    assert.deepEqual(Transformation.rotate(0.5).decompose().getUnsafe(), {
      translate: [0, 0, 0],
      scale: [1, 1, 1],
      skew: [0, 0, 0],
      rotate: [0, 0, -0.24740395925452288, 0.9689124217106448],
      perspective: [0, 0, 0, 1],
    });
  });

  it("decomposes a perspective transformation", () => {
    assert.deepEqual(Transformation.perspective(10).decompose().getUnsafe(), {
      translate: [0, 0, 0],
      scale: [1, 1, 1],
      skew: [0, 0, 0],
      rotate: [0, 0, 0, 1],
      perspective: [0, 0, -0.1, 1],
    });
  });

  it("decomposes several transformations", () => {
    assert.deepEqual(
      Transformation.translate(10, 20, 30)
        .scale(10, 20, 30)
        .rotate(0.5)
        .decompose()
        .getUnsafe(),
      {
        translate: [10, 20, 30],
        scale: [10, 20, 30],
        skew: [0, 0, 0],
        rotate: [0, 0, -0.24740395925452288, 0.9689124217106448],
        perspective: [0, 0, 0, 1],
      },
    );
  });
});
