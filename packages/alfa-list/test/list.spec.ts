import { test } from "@siteimprove/alfa-test";

import { List } from "../src/list";

const array = (length: number) => new Array(length).fill(0).map((_, i) => i);

const list = List.of(1, 2, 3, 4);

test("#size gets the size of a list", t => {
  t.deepEqual(list.size, 4);
});

test("#map() applies a function to every value of a list", t => {
  t.deepEqual([...list.map(n => n * 2)], [2, 4, 6, 8]);
});

test("#map() does not overflow for large lists", t => {
  t.deepEqual([...list.map(n => n * 2)], [2, 4, 6, 8]);
});

test("#flatMap() applies a function to every value of a list and flattens the result", t => {
  t.deepEqual([...list.flatMap(n => List.of(n, n))], [1, 1, 2, 2, 3, 3, 4, 4]);
});

test("#get() looks up the value at an index if it exists", t => {
  t.deepEqual(list.get(2).get(), 3);
});

test("#get() returns none when getting an index that is out of bounds", t => {
  t(list.get(-1).isNone());
  t(list.get(4).isNone());
});

test("#set() updates a value at an index if it exists", t => {
  t.deepEqual([...list.set(2, 42)], [1, 2, 42, 4]);
});

test("#set() does nothing when setting an index that is out of bounds", t => {
  t.equal(list.set(-1, 42), list);
  t.equal(list.set(4, 42), list);
});

test("#push() appends a value to a list", t => {
  t.deepEqual([...list.push(5)], [1, 2, 3, 4, 5]);
});

test("#push() behaves for large lists", t => {
  const list = List.from(array(100000));

  t.deepEqual([...list.push(100000)], array(100001));
});

test("#equals() returns true if two lists are equal", t => {
  t(list.equals(List.of(1, 2, 3, 4)));
});

test("#equals() returns false if two lists are not equal", t => {
  t(!list.equals(List.of(1, 2, 3, 5)));
});
