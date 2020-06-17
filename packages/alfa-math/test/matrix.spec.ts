import { test } from "@siteimprove/alfa-test";

import { Matrix } from "../src/matrix";

test(".identity() constructs an identity matrix of a given size", (t) => {
  t.deepEqual(Matrix.identity(0), []);

  t.deepEqual(Matrix.identity(1), [[1]]);

  t.deepEqual(Matrix.identity(2), [
    [1, 0],
    [0, 1],
  ]);

  t.deepEqual(Matrix.identity(3), [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]);

  t.deepEqual(Matrix.identity(4), [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]);
});

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

test(".subtract() subtracts two matrices of equal size", (t) => {
  t.deepEqual(
    Matrix.subtract(
      [
        [8, 4],
        [1, 9],
      ],
      [
        [2, 3],
        [4, 5],
      ]
    ),
    [
      [6, 1],
      [-3, 4],
    ]
  );
});

test(".multiply() multiplies a matrix and a scalar", (t) => {
  t.deepEqual(
    Matrix.multiply(
      [
        [8, 4],
        [1, 9],
      ],
      2
    ),
    [
      [16, 8],
      [2, 18],
    ]
  );
});

test(".multiply() multiplies two matrices", (t) => {
  t.deepEqual(
    Matrix.multiply(
      [
        [8, 4, 3],
        [1, 9, 2],
      ],
      [
        [8, 4],
        [1, 9],
        [7, 3],
      ]
    ),
    [
      [89, 77],
      [31, 91],
    ]
  );
});

test(".transpose() computes the tranpose of a matrix", (t) => {
  t.deepEqual(
    Matrix.transpose([
      [8, 4, 3],
      [1, 9, 2],
    ]),
    [
      [8, 1],
      [4, 9],
      [3, 2],
    ]
  );
});

test(".determinant() computes the determinant of a square matrix", (t) => {
  t.equal(
    Matrix.determinant([
      [8, 4],
      [1, 9],
    ]),
    68
  );
});

test(".inverse() computes the inverse of an invertible matrix", (t) => {
  const a = [
    [8, 4],
    [1, 9],
  ];

  const b = Matrix.inverse(a);

  const i = Matrix.identity(2);

  // For `b` to be the inverse of `a`, the following must hold:
  //
  //   ab = ba = i
  //
  // We check this by verifying that `ab = i` and `ba = i`.

  t.deepEqual(Matrix.multiply(a, b), i);
  t.deepEqual(Matrix.multiply(b, a), i);
});
