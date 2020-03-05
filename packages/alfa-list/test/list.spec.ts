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

test("#get() returns none when getting from an empty list", t => {
  const list = List.empty<number>();

  t(list.get(0).isNone());
});

test("#set() updates a value at an index if it exists", t => {
  t.deepEqual([...list.set(2, 42)], [1, 2, 42, 4]);
});

test("#set() does nothing when setting an index that is out of bounds", t => {
  t.equal(list.set(-1, 42), list);
  t.equal(list.set(4, 42), list);
});

test("#set() does nothing to an empty list", t => {
  const list = List.empty<number>();

  t.equal(list.set(0, 42), list);
});

test("#set() does nothing when setting an index to the same value", t => {
  t.equal(list.set(0, 1), list);
});

test("#set() and #get() work within the head of a list", t => {
  let list = List.from(array(1000));

  list = list.set(2, 42);

  t.equal(list.get(2).get(), 42);
});

test("#push() appends a value to a list", t => {
  t.deepEqual([...list.push(5)], [1, 2, 3, 4, 5]);
});

test("#push() behaves for large lists", t => {
  let list = List.empty<number>();

  for (let i = 0; i < 100000; i++) {
    list = list.push(i);
    t.equal(list.get(i).get(), i);
  }
});

test("#pop() removes the last value of a list", t => {
  t.deepEqual([...list.pop()], [1, 2, 3]);
});

test("#pop() does nothing to an empty list", t => {
  const list = List.empty<number>();

  t.equal(list.pop(), list);
});

test("#pop() removes the last value of a singleton list", t => {
  const list = List.of(1);

  t.equal(list.pop(), List.empty());
});

test("#pop() behaves for large lists", t => {
  let list = List.from(array(100000));

  for (let i = 100000; i-- >= 0; i) {
    list = list.pop();
    t(list.get(i).isNone());
  }
});

test("#equals() returns true if two lists are equal", t => {
  t(list.equals(List.of(1, 2, 3, 4)));
});

test("#equals() returns false if two lists are not equal", t => {
  t(!list.equals(List.of(1, 2, 3, 5)));
});
