import { test } from "@siteimprove/alfa-test";

import { None, Some } from "@siteimprove/alfa-option";
import { Cache } from "../dist/cache.js";

type Foo = { x: number };
type Bar = { y: string };

const zero: Foo = { x: 0 };
const one: Foo = { x: 1 };
const two: Foo = { x: 2 };

const a: Bar = { y: "a" };
const b: Bar = { y: "bbbbbbbbbb" };

// This effectively does a basic test of Cache.merge
const cache = Cache.from([
  [zero, 0],
  [one, 1],
]);

test("has()/get() returns some when getting a value that does exist", (t) => {
  t(cache.has(zero));
  t.deepEqual(cache.get(zero), Some.of(0));
});

test("has()/get() returns none when getting a value that does not exist", (t) => {
  // We do not want to use `two` here to avoid race condition if tests are
  // run asynchronously.
  t(!cache.has({ x: 2 }));
  t.equal(cache.get({ x: 2 }), None);
});

test("set() adds a value to a cache", (t) => {
  cache.set(two, 2);
  t(cache.has(two));
  t.deepEqual(cache.get(two), Some.of(2));
});

test("get() adds a value to a cache when ifMissing is provided", (t) => {
  const three: Foo = { x: 3 };
  const value = cache.get(three, () => 3);

  t(cache.has(three));
  t.equal(value, 3);
});
