import { test } from "@siteimprove/alfa-test";

import { Matrix } from "../src/matrix";

test(".add() adds two matrices of equal size", (t) => {
  t.deepEqual(
    Matrix.add(
      [
        [1, 2],
        [3, 4],
      ],
      [
        [2, 3],
        [4, 5],
      ]
    ),
    [
      [3, 5],
      [7, 9],
    ]
  );
});
