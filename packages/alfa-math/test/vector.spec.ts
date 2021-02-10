import { test } from "@siteimprove/alfa-test";

import { Vector } from "../src/vector";

test(".add() adds two vectors of equal size", (t) => {
  t.deepEqual(Vector.add([1, 2, 3, 4], [2, 3, 4, 5]), [3, 5, 7, 9]);
});

test(".subtract() subtracts two vectors of equal size", (t) => {
  t.deepEqual(Vector.subtract([8, 3, 2, 6], [2, 3, 4, 5]), [6, 0, -2, 1]);
});

test(".multiply() multiplies a vector and a scalar", (t) => {
  t.deepEqual(Vector.multiply([1, 2, 3, 4], 2), [2, 4, 6, 8]);
});

test(".divide() divides a vector and a scalar", (t) => {
  t.deepEqual(Vector.divide([1, 2, 3, 4], 2), [0.5, 1, 1.5, 2]);
});

test(".dot() computes the dot product of two vectors of equal size", (t) => {
  t.equal(Vector.dot([8, 3, 2, 6], [2, 3, 4, 5]), 63);
});

test(".cross() computes the cross product of two 3-dimensional vectors", (t) => {
  t.deepEqual(Vector.cross([8, 3, 2], [2, 3, 4]), [6, -28, 18]);
});

test(".norm() computes the norm of a vector", (t) => {
  t.equal(Vector.norm([2, 3, 6]), 7);
});
