import { test } from "@siteimprove/alfa-test";

import { Transformation } from "../src/transformation";

test("#decompose() decomposes a translation transformation", (t) => {
  t.deepEqual(Transformation.translate(10, 20, 30).decompose().get(), {
    translate: [10, 20, 30],
    scale: [1, 1, 1],
    skew: [0, 0, 0],
    rotate: [0, 0, 0, 1],
    perspective: [0, 0, 0, 1],
  });
});

test("#decompose() decomposes a scaling transformation", (t) => {
  t.deepEqual(Transformation.scale(10, 20, 30).decompose().get(), {
    translate: [0, 0, 0],
    scale: [10, 20, 30],
    skew: [0, 0, 0],
    rotate: [0, 0, 0, 1],
    perspective: [0, 0, 0, 1],
  });
});

test("#decompose() decomposes a rotation transformation", (t) => {
  t.deepEqual(Transformation.rotate(0.5).decompose().get(), {
    translate: [0, 0, 0],
    scale: [1, 1, 1],
    skew: [0, 0, 0],
    rotate: [0, 0, -0.24740395925452288, 0.9689124217106448],
    perspective: [0, 0, 0, 1],
  });
});

test("#decompose() decomposes a perspective transformation", (t) => {
  t.deepEqual(Transformation.perspective(10).decompose().get(), {
    translate: [0, 0, 0],
    scale: [1, 1, 1],
    skew: [0, 0, 0],
    rotate: [0, 0, 0, 1],
    perspective: [0, 0, -0.1, 1],
  });
});

test("#decompose() decomposes several transformations", (t) => {
  t.deepEqual(
    Transformation.translate(10, 20, 30)
      .scale(10, 20, 30)
      .rotate(0.5)
      .decompose()
      .get(),
    {
      translate: [10, 20, 30],
      scale: [10, 20, 30],
      skew: [0, 0, 0],
      rotate: [0, 0, -0.24740395925452288, 0.9689124217106448],
      perspective: [0, 0, 0, 1],
    }
  );
});
