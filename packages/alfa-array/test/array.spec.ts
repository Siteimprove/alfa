import { test } from "@siteimprove/alfa-test";

import { Array } from "../src/array";
import { Comparison } from "@siteimprove/alfa-comparable";
import { Equatable } from "@siteimprove/alfa-equatable";

test("#from() returns the same instance if the array is already an array", (t) => {
  const array = [1, 2, 3];

  t.equal(Array.from(array), array);
});

test("#isEmpty() returns true if the array is empty", (t) => {
  t.equal(Array.isEmpty([]), true);
});

test("#isEmpty() returns false if the array is not empty", (t) => {
  t.equal(Array.isEmpty([1, 2, 3]), false);
});

test("#forEach() iterates over each element in the array", (t) => {
  const array = [1, 2, 3];

  let i = 0;

  Array.forEach(array, (value, index) => {
    t.equal(value, array[i]);
    t.equal(index, i);
    i++;
  });

  t.equal(i, array.length);
});

test("#reduceWhile() reduces the array while the predicate is true", (t) => {
  const array = [1, 2, 3, 4, 5];

  const sum = Array.reduceWhile(
    array,
    (value) => value < 4,
    (sum, value) => sum + value,
    0,
  );

  t.equal(sum, 6);
});

test("#filter() filters the array", (t) => {
  const array = [1, 2, 3, 4, 5];

  const filtered = Array.filter(array, (value) => value % 2 === 0);

  t.deepEqual(filtered, [2, 4]);
});

test("#find() finds the first element in the array that satisfies the predicate", (t) => {
  const array = [1, 2, 3, 4, 5];

  const found = Array.find(array, (value) => value % 2 === 0);

  t.equal(found.getUnsafe(), 2);
});

test("#find() returns none if no element in the array satisfies the predicate", (t) => {
  const array = [1, 2, 3, 4, 5];

  const found = Array.find(array, (value) => value === 6);

  t.equal(found.isNone(), true);
});

test("#findLast() finds the last element in the array that satisfies the predicate", (t) => {
  const array = [1, 2, 3, 4, 5];

  const found = Array.findLast(array, (value) => value % 2 === 0);

  t.equal(found.getUnsafe(), 4);
});

test("#some() returns true if any element in the array satisfies the predicate", (t) => {
  const array = [1, 2, 3, 4, 5];

  t.equal(
    Array.some(array, (value) => value % 2 === 0),
    true,
  );
});

test("#some() returns false if no element in the array satisfies the predicate", (t) => {
  const array = [1, 2, 3, 4, 5];

  t.equal(
    Array.some(array, (value) => value === 6),
    false,
  );
});

test("#every() returns true if all elements in the array satisfy the predicate", (t) => {
  const array = [1, 2, 3, 4, 5];

  t.equal(
    Array.every(array, (value) => value < 6),
    true,
  );
});

test("#every() returns false if any element in the array does not satisfy the predicate", (t) => {
  const array = [1, 2, 3, 4, 5];

  t.equal(
    Array.every(array, (value) => value < 5),
    false,
  );
});

test("#count() counts the number of elements in the array that satisfy the predicate", (t) => {
  const array = [1, 2, 3, 4, 5];

  t.equal(
    Array.count(array, (value) => value % 2 === 0),
    2,
  );
});

test("#distinct() returns a new array with all duplicate elements removed", (t) => {
  const array = [1, 2, 3, 4, 5, 1, 2, 3];

  t.deepEqual(Array.distinct(array), [1, 2, 3, 4, 5]);
});

test("#get() returns the element at the given index if it exists", (t) => {
  const array = [1, 2, 3, 4, 5];

  t.equal(Array.get(array, 2).getUnsafe(), 3);
});

test("#get() returns none if the element at the given index does not exist", (t) => {
  const array = [1, 2, 3, 4, 5];

  t.equal(Array.get(array, 5).isNone(), true);
});

test("#insert() inserts the given element at the given index", (t) => {
  const array = [1, 2, 3, 4, 5];

  t.deepEqual(Array.insert(array, 2, 6), [1, 2, 6, 3, 4, 5]);
});

test("#concat() concatenates the given arrays", (t) => {
  const array1 = [1, 2, 3];
  const array2 = [4, 5, 6];

  t.deepEqual(Array.concat(array1, array2), [1, 2, 3, 4, 5, 6]);
});

test("#subtract() subtracts the given arrays", (t) => {
  const array1 = [1, 2, 3];
  const array2 = [2, 3, 4];

  t.deepEqual(Array.subtract(array1, array2), [1]);
});

test("#intersect() intersects the given arrays", (t) => {
  const array1 = [1, 2, 3];
  const array2 = [2, 3, 4];

  t.deepEqual(Array.intersect(array1, array2), [2, 3]);
});

test("#zip() zips the given arrays", (t) => {
  const array1 = [1, 2, 3];
  const array2 = [4, 5, 6];

  t.deepEqual(Array.zip(array1, array2), [
    [1, 4],
    [2, 5],
    [3, 6],
  ]);
});

test("#first() returns the first element in the array", (t) => {
  const array = [1, 2, 3, 4, 5];

  t.equal(Array.first(array).getUnsafe(), 1);
});

test("#last() returns the last element in the array", (t) => {
  const array = [1, 2, 3, 4, 5];

  t.equal(Array.last(array).getUnsafe(), 5);
});

const comparer = (a: number, b: number) => {
  if (a < b) return Comparison.Less;
  if (a > b) return Comparison.Greater;
  return Comparison.Equal;
};

test("#search() returns the index of an element in a sorted array given a custom comparer", (t) => {
  const array = [1, 2, 3, 4, 5];

  t.equal(Array.search(array, 1, comparer), 0);
  t.equal(Array.search(array, 3, comparer), 2);
  t.equal(Array.search(array, 5, comparer), 4);
});

test("#search() returns wrong index if array is not sorted", (t) => {
  const array = [1, 3, 2, 5, 4];

  t.equal(Array.search(array, 3, comparer), 3);
});

test("#search() returns wrong index if value is not found", (t) => {
  const array = [1, 2, 3, 4, 5];

  t.equal(Array.search(array, 6, comparer), 5);
});

class Foo implements Equatable {
  public constructor(public readonly value: number) {}

  public equals(value: unknown): value is this {
    return value instanceof Foo && value.value === this.value;
  }
}

test("#equals() returns true if the elements are instances of Equatable and are pairwise equal", (t) => {
  const array1 = [new Foo(1), new Foo(2), new Foo(3)];
  const array2 = [new Foo(1), new Foo(2), new Foo(3)];

  t.equal(Array.equals(array1, array2), true);
});

test("#equals() returns false if the elements are instances of Equatable and are not pairwise equal", (t) => {
  const array1 = [new Foo(1), new Foo(2), new Foo(3)];
  const array2 = [new Foo(1), new Foo(2), new Foo(4)];

  t.equal(Array.equals(array1, array2), false);
});

test("#equals() returns true if elements are pairwise strictly equal", (t) => {
  const array1 = [1, 2, 3];
  const array2 = [1, 2, 3];

  t.equal(Array.equals(array1, array2), true);
});

test("#equals() returns false if elements are not pairwise strictly equal", (t) => {
  const array1 = [1, 2, 3];
  const array2 = [1, 2, 4];

  t.equal(Array.equals(array1, array2), false);
});

test("#equals() returns false if the arrays have different lengths", (t) => {
  const array1 = [1, 2, 3];
  const array2 = [1, 2, 3, 4];

  t.equal(Array.equals(array1, array2), false);
});
