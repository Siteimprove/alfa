import { test } from "@siteimprove/alfa-test";

import { Vector } from "../src/vector";

test(".add() adds two vectors of equal size", (t) => {
  t.deepEqual(Vector.add([1, 2, 3, 4], [2, 3, 4, 5]), [3, 5, 7, 9]);
});
