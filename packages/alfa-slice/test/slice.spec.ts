import { test } from "@siteimprove/alfa-test";

import { Slice } from "../src/slice";

const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

test(".of() constructs a slice over an array", (t) => {
  const slice = Slice.of(arr, 2, 8);

  t.equal(slice.offset, 2);
  t.equal(slice.length, 6);
  t.equal(slice.array, arr);
  t.deepEqual([...slice], [2, 3, 4, 5, 6, 7]);
});

test("#get() returns the value at a given index of a slice", (t) => {
  const slice = Slice.of(arr, 2, 8);

  t.equal(slice.get(0).get(), 2);
  t.equal(slice.get(5).get(), 7);
});

test("#get() returns none when an index is out of bounds", (t) => {
  const slice = Slice.of(arr, 2, 8);

  t(slice.get(-1).isNone());
  t(slice.get(6).isNone());
});

test("#slice() returns a slice of an existing slice", (t) => {
  const slice = Slice.of(arr, 2, 8);

  t.deepEqual([...slice.slice(2, 4)], [4, 5]);
});

test("#equals() returns true if two slices are equal", (t) => {
  const a = Slice.of(arr, 2, 8);
  const b = Slice.of(arr, 2, 8);

  t(a.equals(b));
  t(a.equals(Slice.of([2, 3, 4, 5, 6, 7], 0, 6)));
});

test("#equals() returns false if two slices are not equal", (t) => {
  const a = Slice.of(arr, 2, 8);
  const b = Slice.of(
    arr.map((n) => n + 1),
    2,
    8
  );

  t(!a.equals(b));
  t(!a.equals([2, 3, 4, 5, 6, 7]));
});

test("#toArray() returns an array representation of a slice", (t) => {
  const slice = Slice.of(arr, 2, 8);

  t.deepEqual(slice.toArray(), [2, 3, 4, 5, 6, 7]);
});

test("#toJSON() returns a JSON representation of a slice", (t) => {
  const slice = Slice.of(arr, 2, 8);

  t.deepEqual(slice.toJSON(), [2, 3, 4, 5, 6, 7]);
});

test("#toString() returns a string representation of a slice", (t) => {
  const slice = Slice.of(arr, 2, 8);

  t.equal(slice.toString(), "Slice [ 2, 3, 4, 5, 6, 7 ]");
});

test("#toString() returns a string representation of an empty slice", (t) => {
  const slice = Slice.empty<number>();

  t.equal(slice.toString(), "Slice []");
});
