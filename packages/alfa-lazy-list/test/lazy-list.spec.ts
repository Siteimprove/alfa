import { test } from "@siteimprove/alfa-test";

import { LazyList } from "../dist/index.js";

// Tests for set()
test("LazyList.set() replaces value at index", (t) => {
  const list = LazyList.of(1, 2, 3, 4);
  const result = list.set(1, 10);

  t.deepEqual(result.toArray(), [1, 10, 3, 4]);
});

test("LazyList.set() returns same list if value equals existing", (t) => {
  const list = LazyList.of(1, 2, 3, 4);
  const result = list.set(1, 2);

  t(result.equals(list));
});

test("LazyList.set() returns same list for negative index", (t) => {
  const list = LazyList.of(1, 2, 3, 4);
  const result = list.set(-1, 10);

  t.equal(result, list);
});

test("LazyList.set() returns same list for out of bounds index", (t) => {
  const list = LazyList.of(1, 2, 3, 4);
  const result = list.set(10, 10);

  t.deepEqual(result.toArray(), [1, 2, 3, 4]);
});

test("LazyList.set() at index 0", (t) => {
  const list = LazyList.of(1, 2, 3);
  const result = list.set(0, 10);

  t.deepEqual(result.toArray(), [10, 2, 3]);
});

// Tests for insert()
test("LazyList.insert() prepends at index 0", (t) => {
  const list = LazyList.of(1, 2, 3);
  const result = list.insert(0, 0);

  t.deepEqual(result.toArray(), [0, 1, 2, 3]);
});

test("LazyList.insert() inserts at middle position", (t) => {
  const list = LazyList.of(1, 2, 3);
  const result = list.insert(1, 5);

  t.deepEqual(result.toArray(), [1, 5, 2, 3]);
});

test("LazyList.insert() inserts at position 2", (t) => {
  const list = LazyList.of(1, 2, 3);
  const result = list.insert(2, 5);

  t.deepEqual(result.toArray(), [1, 2, 5, 3]);
});

test("LazyList.insert() appends at end when index equals size", (t) => {
  const list = LazyList.of(1, 2, 3);
  const result = list.insert(3, 4);

  t.deepEqual(result.toArray(), [1, 2, 3, 4]);
});

test("LazyList.insert() returns unchanged for index beyond size", (t) => {
  const list = LazyList.of(1, 2, 3);
  const result = list.insert(10, 5);

  t.deepEqual(result.toArray(), [1, 2, 3]);
});

test("LazyList.insert() on empty list at index 0", (t) => {
  const list = LazyList.empty<number>();
  const result = list.insert(0, 1);

  t.deepEqual(result.toArray(), [1]);
});

test("LazyList.insert() on empty list at index > 0", (t) => {
  const list = LazyList.empty<number>();
  const result = list.insert(5, 1);

  t.deepEqual(result.toArray(), []);
});

test("LazyList.insert() returns same list for negative index", (t) => {
  const list = LazyList.of(1, 2, 3);
  const result = list.insert(-1, 5);

  t.equal(result, list);
});

test("LazyList.insert() on single element list at index 0", (t) => {
  const list = LazyList.of(5);
  const result = list.insert(0, 1);

  t.deepEqual(result.toArray(), [1, 5]);
});

test("LazyList.insert() on single element list at index 1", (t) => {
  const list = LazyList.of(5);
  const result = list.insert(1, 10);

  t.deepEqual(result.toArray(), [5, 10]);
});

// Comparison tests to verify different semantics of set vs insert
test("LazyList.insert() vs set() - different behavior", (t) => {
  const list = LazyList.of(1, 2, 3);

  // set replaces, insert shifts
  const setResult = list.set(1, 10);
  const insertResult = list.insert(1, 10);

  t.deepEqual([...setResult], [1, 10, 3]);
  t.deepEqual([...insertResult], [1, 10, 2, 3]);
});

test("LazyList.insert() maintains immutability", (t) => {
  const original = LazyList.of(1, 2, 3);
  const result = original.insert(1, 10);

  // Original should be unchanged
  t.deepEqual([...original], [1, 2, 3]);
  // Result should have insertion
  t.deepEqual(result.toArray(), [1, 10, 2, 3]);
});

test("LazyList.set() maintains immutability", (t) => {
  const original = LazyList.of(1, 2, 3);
  const result = original.set(1, 10);

  // Original should be unchanged
  t.deepEqual([...original], [1, 2, 3]);
  // Result should have replacement
  t.deepEqual(result.toArray(), [1, 10, 3]);
});

// Tests for trim()
test("LazyList.trim() removes matching elements from both ends", (t) => {
  const list = LazyList.of(0, 0, 1, 2, 3, 0, 0);
  const result = list.trim((x) => x === 0);

  t.deepEqual(result.toArray(), [1, 2, 3]);
});

test("LazyList.trim() on empty list", (t) => {
  const list = LazyList.empty<number>();
  const result = list.trim((x) => x === 0);

  t.deepEqual(result.toArray(), []);
});

test("LazyList.trim() when nothing matches", (t) => {
  const list = LazyList.of(1, 2, 3);
  const result = list.trim((x) => x === 0);

  t.deepEqual(result.toArray(), [1, 2, 3]);
});

test("LazyList.trim() when everything matches", (t) => {
  const list = LazyList.of(0, 0, 0);
  const result = list.trim((x) => x === 0);

  t.deepEqual(result.toArray(), []);
});

// Tests for trimLeading()
test("LazyList.trimLeading() removes matching elements from start", (t) => {
  const list = LazyList.of(0, 0, 1, 2, 3, 0);
  const result = list.trimLeading((x) => x === 0);

  t.deepEqual(result.toArray(), [1, 2, 3, 0]);
});

test("LazyList.trimLeading() on empty list", (t) => {
  const list = LazyList.empty();
  const result = list.trimLeading((x) => x === 0);

  t.deepEqual(result.toArray(), []);
});

test("LazyList.trimLeading() when nothing matches", (t) => {
  const list = LazyList.of(1, 2, 3);
  const result = list.trimLeading((x) => x === 0);

  t.deepEqual(result.toArray(), [1, 2, 3]);
});

// Tests for trimTrailing()
test("LazyList.trimTrailing() removes matching elements from end", (t) => {
  const list = LazyList.of(0, 1, 2, 3, 0, 0);
  const result = list.trimTrailing((x) => x === 0);

  t.deepEqual(result.toArray(), [0, 1, 2, 3]);
});

test("LazyList.trimTrailing() on empty list", (t) => {
  const list = LazyList.empty();
  const result = list.trimTrailing((x) => x === 0);

  t.deepEqual(result.toArray(), []);
});

test("LazyList.trimTrailing() when nothing matches", (t) => {
  const list = LazyList.of(1, 2, 3);
  const result = list.trimTrailing((x) => x === 0);

  t.deepEqual(result.toArray(), [1, 2, 3]);
});

// Tests for rest()
test("LazyList.rest() returns all elements except first", (t) => {
  const list = LazyList.of(1, 2, 3, 4);
  const result = list.rest();

  t.deepEqual(result.toArray(), [2, 3, 4]);
});

test("LazyList.rest() on empty list", (t) => {
  const list = LazyList.empty();
  const result = list.rest();

  t.deepEqual(result.toArray(), []);
});

test("LazyList.rest() on single element list", (t) => {
  const list = LazyList.of(1);
  const result = list.rest();

  t.deepEqual(result.toArray(), []);
});

// Tests for slice()
test("LazyList.slice() returns elements from start to end", (t) => {
  const list = LazyList.of(1, 2, 3, 4, 5);
  const result = list.slice(1, 4);

  t.deepEqual(result.toArray(), [2, 3, 4]);
});

test("LazyList.slice() with only start parameter", (t) => {
  const list = LazyList.of(1, 2, 3, 4, 5);
  const result = list.slice(2);

  t.deepEqual(result.toArray(), [3, 4, 5]);
});

test("LazyList.slice() with negative start", (t) => {
  const list = LazyList.of(1, 2, 3, 4);
  const result = list.slice(-1, 2);

  t.deepEqual(result.toArray(), [1, 2]);
});

test("LazyList.slice() with end <= start", (t) => {
  const list = LazyList.of(1, 2, 3, 4);
  const result = list.slice(2, 1);

  t.deepEqual(result.toArray(), []);
});

test("LazyList.slice() with end > length", (t) => {
  const list = LazyList.of(1, 2, 3, 4);
  const result = list.slice(1, 100);

  t.deepEqual(result.toArray(), [2, 3, 4]);
});

test("LazyList.slice() on empty list", (t) => {
  const list = LazyList.empty();
  const result = list.slice(1, 3);

  t.deepEqual(result.toArray(), []);
});

// Tests for join()
test("LazyList.join() concatenates elements with separator", (t) => {
  const list = LazyList.of("a", "b", "c");
  const result = list.join(", ");

  t.equal(result, "a, b, c");
});

test("LazyList.join() on empty list", (t) => {
  const list = LazyList.empty();
  const result = list.join(", ");

  t.equal(result, "");
});

test("LazyList.join() with single element", (t) => {
  const list = LazyList.of("a");
  const result = list.join(", ");

  t.equal(result, "a");
});

test("LazyList.join() with empty separator", (t) => {
  const list = LazyList.of("a", "b", "c");
  const result = list.join("");

  t.equal(result, "abc");
});

// Basic equality tests
test("LazyList.equals() returns true for two empty lists", (t) => {
  const list1 = LazyList.empty();
  const list2 = LazyList.empty();

  t.equal(list1.equals(list2), true);
});

test("LazyList.equals() returns true for lists with same elements", (t) => {
  const list1 = LazyList.of(1, 2, 3);
  const list2 = LazyList.of(1, 2, 3);

  t.equal(list1.equals(list2), true);
});

test("LazyList.equals() returns false for lists with different elements", (t) => {
  const list1 = LazyList.of(1, 2, 3);
  const list2 = LazyList.of(1, 2, 4);

  t.equal(list1.equals(list2), false);
});

test("LazyList.equals() returns false for lists with different lengths (first shorter)", (t) => {
  const list1 = LazyList.of(1, 2);
  const list2 = LazyList.of(1, 2, 3);

  t.equal(list1.equals(list2), false);
});

test("LazyList.equals() returns false for lists with different lengths (first longer)", (t) => {
  const list1 = LazyList.of(1, 2, 3);
  const list2 = LazyList.of(1, 2);

  t.equal(list1.equals(list2), false);
});

test("LazyList.equals() returns true for single element lists with same value", (t) => {
  const list1 = LazyList.of(42);
  const list2 = LazyList.of(42);

  t.equal(list1.equals(list2), true);
});

test("LazyList.equals() returns false for single element lists with different values", (t) => {
  const list1 = LazyList.of(42);
  const list2 = LazyList.of(43);

  t.equal(list1.equals(list2), false);
});

// Type checking tests
test("LazyList.equals() returns false for non-LazyList values", (t) => {
  const list = LazyList.of(1, 2, 3);

  t.equal(list.equals([1, 2, 3]), false);
  t.equal(list.equals({ length: 3 }), false);
  t.equal(list.equals(null), false);
  t.equal(list.equals(undefined), false);
  t.equal(list.equals("1,2,3"), false);
});

// String element tests
test("LazyList.equals() works with string elements", (t) => {
  const list1 = LazyList.of("a", "b", "c");
  const list2 = LazyList.of("a", "b", "c");
  const list3 = LazyList.of("a", "b", "d");

  t.equal(list1.equals(list2), true);
  t.equal(list1.equals(list3), false);
});

// Object element tests (if they implement equals)
test("LazyList.equals() works with complex objects", (t) => {
  const list1 = LazyList.of(
    { value: 1, equals: (other: any) => other.value === 1 },
    { value: 2, equals: (other: any) => other.value === 2 },
  );
  const list2 = LazyList.of(
    { value: 1, equals: (other: any) => other.value === 1 },
    { value: 2, equals: (other: any) => other.value === 2 },
  );

  t.equal(list1.equals(list2), true);
});

// Test with empty static instance
test("LazyList.equals() works with empty static instance", (t) => {
  const empty1 = LazyList.empty();
  const empty2 = LazyList.empty();
  const empty3 = LazyList.empty();

  t.equal(empty1.equals(empty2), true);
  t.equal(empty1.equals(empty3), true);
});

// Test with same instance
test("LazyList.equals() returns true when comparing same instance", (t) => {
  const list = LazyList.of(1, 2, 3);

  t.equal(list.equals(list), true);
});

// Test with transformed lists
test("LazyList.equals() works with mapped lists", (t) => {
  const list1 = LazyList.of(1, 2, 3).map((x) => x * 2);
  const list2 = LazyList.of(2, 4, 6);

  t.equal(list1.equals(list2), true);
});

test("LazyList.equals() works with filtered lists", (t) => {
  const list1 = LazyList.of(1, 2, 3, 4, 5).filter((x) => x % 2 === 0);
  const list2 = LazyList.of(2, 4);

  t.equal(list1.equals(list2), true);
});

// Test with different element orders
test("LazyList.equals() returns false for same elements in different order", (t) => {
  const list1 = LazyList.of(1, 2, 3);
  const list2 = LazyList.of(3, 2, 1);

  t.equal(list1.equals(list2), false);
});

// Large list test
test("LazyList.equals() works with large lists", (t) => {
  const arr = Array.from({ length: 1000 }, (_, i) => i);
  const list1 = LazyList.from(arr);
  const list2 = LazyList.from(arr);
  const list3 = LazyList.of(...arr, 1000);

  t.equal(list1.equals(list2), true);
  t.equal(list1.equals(list3), false);
});

// Test that equals doesn't consume the list more than necessary
test("LazyList.equals() stops early on mismatch", (t) => {
  let list1Count = 0;
  let list2Count = 0;

  const list1 = LazyList.of(1, 2, 3, 4, 5).map((x) => {
    list1Count++;
    return x;
  });

  const list2 = LazyList.of(1, 9, 3, 4, 5).map((x) => {
    list2Count++;
    return x;
  });

  // Should stop comparing after finding mismatch at index 1
  list1.equals(list2);

  // Both lists should only have processed up to the mismatch point
  t.equal(list1Count, 2);
  t.equal(list2Count, 2);
});
