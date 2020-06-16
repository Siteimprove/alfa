import { test } from "@siteimprove/alfa-test";

import { Transformation } from "../src/transformation";

test("#decompose() decomposes a rotation transformation", (t) => {
  t.deepEqual(Transformation.rotate(0.5).decompose().get(), {
    translate: [0, 0, 0],
    scale: [1, 1, 1],
    skew: [0, 0, 0],
    rotate: [0, 0, -0.24740395925452288, 0.9689124217106448],
    perspective: [0, 0, 0, 1],
  });
});
