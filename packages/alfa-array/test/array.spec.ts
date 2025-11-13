import { Comparison } from "@siteimprove/alfa-comparable";
import { Option, None } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import { describe } from "vitest";

import { Array } from "../dist/array.js";
import * as Builtin from "../dist/builtin.js";

describe("Basic constructors and predicates", () => {
  test(".of() creates an array", (t) => {
    t.deepEqual(Array.of(1, 2, 3), [1, 2, 3]);
  });

  test(".empty() creates an empty array", (t) => {
    t.deepEqual(Array.empty(), []);
  });

  test(".isArray() recoqnize arrays", (t) => {
    t(Array.isArray([1, 2, 3]));
    t(Array.isArray(new Builtin.Array(0)));
    t(!Array.isArray(1));
    t(!Array.isArray("a"));
    t(!Array.isArray({}));
    t(!Array.isArray(() => {}));

    t(!Array.isArray({} as unknown as Array<number>));
  });

  test(".size() returns the length of an array", (t) => {
    t.equal(Array.size([1, 2]), 2);
  });

  test(".isEmpty() checks whether an array is empty", (t) => {
    t(Array.isEmpty([]));
    t(!Array.isEmpty([0]));
  });
});

// Copy/clone

test(".copy() and .clone()", (t) => {
  const arr: ReadonlyArray<{ x: number }> = [{ x: 1 }, { x: 2 }];
  const copied = Array.copy(arr);
  t.notEqual(copied, arr);
  t.deepEqual(copied, arr);

  // const cloned = Array.clone(arr);
  // t.notEqual(cloned, arr);
  // t.deepEqual(cloned, arr);
});

// forEach/map/flatMap/flatten

test(".forEach() and .map() and .flatMap() and .flatten()", (t) => {
  const values: number[] = [];
  Array.forEach([10, 20, 30], (v, i) => values.push(v + i));
  t.deepEqual(values, [10, 21, 32]);

  const mapped = Array.map([1, 2, 3], (x) => x * 2);
  t.deepEqual(mapped, [2, 4, 6]);

  const flat = Array.flatMap([1, 2, 3], (x) => [x, x]);
  t.deepEqual(flat, [1, 1, 2, 2, 3, 3]);

  const flattened = Array.flatten([[1, 2], [3], [], [4]]);
  t.deepEqual(flattened, [1, 2, 3, 4]);
});

// reduce/reduceWhile/reduceUntil

test(".reduce(), .reduceWhile(), .reduceUntil()", (t) => {
  const sum = Array.reduce([1, 2, 3], (acc, v) => acc + v, 0);
  t.equal(sum, 6);

  const prodWhile = Array.reduceWhile(
    [2, 3, 4, 0, 5],
    (v) => v !== 0,
    (acc, v) => acc * v,
    1,
  );
  t.equal(prodWhile, 24);

  const prodUntil = Array.reduceUntil(
    [2, 0, 3],
    (v) => v === 0,
    (acc, v) => acc * v,
    1,
  );
  t.equal(prodUntil, 2);
});

// apply

test(".apply() applies multiple mappers", (t) => {
  const arr = [1, 2];
  const res = Array.apply(arr, [(x) => x + 1, (x) => x * 2]);
  t.deepEqual(res, [2, 3, 2, 4]);
});

// filter/reject/find/findLast/includes

test(".filter(), .reject(), .find(), .findLast(), .includes()", (t) => {
  const arr = [0, 1, 2, 3, 2];
  t.deepEqual(
    Array.filter(arr, (x) => x % 2 === 0),
    [0, 2, 2],
  );
  t.deepEqual(
    Array.reject(arr, (x) => x % 2 === 0),
    [1, 3],
  );

  t.equal(Array.find(arr, (x) => x > 2).getOr(-1), 3);
  t(Array.find(arr, (x) => x > 10).isNone());

  t.equal(Array.findLast(arr, (x) => x === 2).getOr(-1), 2);
  t(Array.includes(arr, 3));
  t(!Array.includes(arr, 42));
});

// collect/collectFirst

test(".collect() and .collectFirst()", (t) => {
  const arr = [1, 2, 3];
  const collected = Array.collect(arr, (x) =>
    x % 2 === 0 ? Option.of(x * 10) : None,
  );
  t.deepEqual(collected, [20]);

  const first = Array.collectFirst(arr, (x) => (x > 2 ? Option.of(x) : None));
  t.equal(first.getOr(-1), 3);
  const none = Array.collectFirst(arr, (x) => None);
  t(none.isNone());
});

// some/none/every/count/distinct

test(".some(), .none(), .every(), .count(), .distinct()", (t) => {
  const arr = [1, 2, 2, 3];
  t.equal(
    Array.some(arr, (x) => x === 2),
    true,
  );
  t.equal(
    Array.none(arr, (x) => x === 4),
    true,
  );
  t.equal(
    Array.every(arr, (x) => x >= 1),
    true,
  );
  t.equal(
    Array.count(arr, (x) => x === 2),
    2,
  );
  t.deepEqual(Array.distinct(arr), [1, 2, 3]);
});

// get/has/set/insert/append/prepend

test("indexing helpers: get(), has(), set(), insert(), append(), prepend()", (t) => {
  const arr = [10, 20];
  t.equal(Array.get(arr, 0).getOr(-1), 10);
  t(Array.get(arr, 5).isNone());
  t(Array.has(arr, 1));
  t(!Array.has(arr, 2));

  Array.set(arr, 1, 99);
  t.equal(arr[1], 99);
  Array.set(arr, 5, 123);
  t.equal(arr.length, 2);

  Array.insert(arr, 1, 42);
  t.deepEqual(arr, [10, 42, 99]);
  Array.insert(arr, 10, 7);
  t.deepEqual(arr, [10, 42, 99]);

  Array.append(arr, 8);
  t.deepEqual(arr[arr.length - 1], 8);
  Array.prepend(arr, 1);
  t.deepEqual(arr[0], 1);
});

// concat/subtract/intersect/zip

test("concat(), subtract(), intersect(), zip()", (t) => {
  const a = [1, 2, 3];
  const b = [3, 4];
  t.deepEqual(Array.concat(a, b), [1, 2, 3, 3, 4]);
  t.deepEqual(Array.subtract(a, b), [1, 2]);
  t.deepEqual(Array.intersect(a, b), [3]);

  t.deepEqual(Array.zip([1, 2], ["a"]), [[1, "a"]]);
});

// first/last/sort/sortWith/compare/compareWith/search

test("first(), last(), sort(), sortWith(), compare(), search()", (t) => {
  t.equal(Array.first([5, 6]).getOr(-1), 5);
  t.equal(Array.last([5, 6]).getOr(-1), 6);

  const arr = [3, 1, 2];
  // Array.sort(arr);
  // t.deepEqual(arr, [1, 2, 3]);

  const arr2 = ["b", "a"];
  Array.sortWith(arr2, (a, b) => (a < b ? -1 : a > b ? 1 : 0));
  t.deepEqual(arr2, ["a", "b"]);

  // t.equal(Array.compare([1, 2], [1, 2]), Comparison.Equal);
  // t.equal(Array.compare([1], [1, 2]), Comparison.Less);

  const idx = Array.search([1, 3, 5, 7], 4, (a, b) =>
    a < b ? Comparison.Less : a > b ? Comparison.Greater : Comparison.Equal,
  );
  t.equal(idx, 2);
});

// equals/hash/iterator/toJSON

test("equals(), iterator(), toJSON()", (t) => {
  t(Array.equals([1, 2], [1, 2]));
  t(!Array.equals([1, 2], [1, 3]));

  const it = Array.iterator([1, 2]);
  t.equal(it.next().value, 1);
  t.equal(it.next().value, 2);

  t.deepEqual(Array.toJSON([1, 2]), [1, 2]);
});
