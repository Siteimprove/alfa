import { test } from "@siteimprove/alfa-test";

import { List } from "../src/list";

const ns = List.of(1, 2, 3, 4);

test("get() looks up the value at an index if it exists", t => {
  t.deepEqual(ns.get(2).toJSON(), { value: 3 });
});

test("set() updates a value at an index if it exists", t => {
  t.deepEqual(ns.set(2, 42).toJSON(), [1, 2, 42, 4]);
});

test("map() applies a function to every value of a list", t => {
  t.deepEqual(ns.map(n => n * 2).toJSON(), [2, 4, 6, 8]);
});

test("equals() returns true if two lists are equal", t => {
  t.equal(ns.equals(List.of(1, 2, 3, 4)), true);
});

test("equals() returns false if two lists are not equal", t => {
  t.equal(ns.equals(List.of(1, 2, 3, 5)), false);
});
