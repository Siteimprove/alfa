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

test("memoize caches values of a unary function", (t) => {
  // We also test the return values of `doStuff` to ensure that we didn't retrieve
  // the wrong cache entry.
  let called = 0;

  function doStuff(foo: Foo): number {
    called++;
    return foo.x;
  }

  // Not memoized, `called` is incremented each time
  t.equal(doStuff(zero), 0);
  t.equal(called, 1);

  t.equal(doStuff(zero), 0);
  t.equal(called, 2);

  t.equal(doStuff(one), 1);
  t.equal(called, 3);

  const memoized = Cache.memoize(doStuff);

  // Memoized, `called` is incremented only in case of cache miss.
  t.equal(memoized(zero), 0); // Initial call, miss
  t.equal(called, 4);

  t.equal(memoized(zero), 0); // hit
  t.equal(called, 4);

  t.equal(memoized(one), 1); // different argument, miss
  t.equal(called, 5);

  t.equal(memoized(one), 1); // hit
  t.equal(called, 5);

  t.equal(memoized(zero), 0); // still a hit
  t.equal(called, 5);
});

test("memoize caches values of a binary function", (t) => {
  let called = 0;

  function doStuff(foo: Foo, bar: Bar): number {
    called++;

    return foo.x + bar.y.length;
  }

  // Not memoized, `called` is incremented each time
  t.equal(doStuff(zero, a), 1);
  t.equal(called, 1);

  t.equal(doStuff(one, a), 2);
  t.equal(called, 2);

  t.equal(doStuff(zero, a), 1);
  t.equal(called, 3);

  const memoize = Cache.memoize(doStuff);

  // Memoized, `called` is incremented only in case of cache miss.
  t.equal(memoize(zero, a), 1); // Initial call, miss
  t.equal(called, 4);

  t.equal(memoize(one, a), 2); // different foo, miss
  t.equal(called, 5);

  t.equal(memoize(zero, a), 1); // hit (same as 1st)
  t.equal(called, 5);

  t.equal(memoize(one, a), 2); // hit (same as 2nd)
  t.equal(called, 5);

  t.equal(memoize(zero, b), 10); // different bar, miss
  t.equal(called, 6);

  t.equal(memoize(zero, b), 10); // hit (same as 5th)
  t.equal(called, 6);

  t.equal(memoize(one, b), 11); // different pair, miss
  t.equal(called, 7);
});

test("@memoize caches values of a binary method", (t) => {
  // Here also, we test the return values of `doStuffA` / `doStuffB` to ensure
  // that we didn't retrieve the wrong cache entry.

  class MyClass {
    public called: number;

    public constructor() {
      this.called = 0;
    }

    public doStuffA(foo: Foo, bar: Bar): number {
      this.called++;

      return foo.x + bar.y.length;
    }

    @Cache.memoize
    public doStuffB(foo: Foo, bar: Bar): number {
      this.called++;

      return foo.x + bar.y.length;
    }
  }

  const instance = new MyClass();

  // doStuffA is not cached, `called` is incremented each time
  t.equal(instance.doStuffA(zero, a), 1);
  t.equal(instance.called, 1);

  t.equal(instance.doStuffA(one, a), 2);
  t.equal(instance.called, 2);

  t.equal(instance.doStuffA(zero, a), 1);
  t.equal(instance.called, 3);

  // doStuffB is cached, `called` is incremented only in case of cache miss
  t.equal(instance.doStuffB(zero, a), 1); // Initial call, miss
  t.equal(instance.called, 4);

  t.equal(instance.doStuffB(one, a), 2); // different foo, miss
  t.equal(instance.called, 5);

  t.equal(instance.doStuffB(zero, a), 1); // hit (same as 1st)
  t.equal(instance.called, 5);

  t.equal(instance.doStuffB(one, a), 2); // hit (same as 2nd)
  t.equal(instance.called, 5);

  t.equal(instance.doStuffB(zero, b), 10); // different bar, miss
  t.equal(instance.called, 6);

  t.equal(instance.doStuffB(zero, b), 10); // hit (same as 5th)
  t.equal(instance.called, 6);

  t.equal(instance.doStuffB(one, b), 11); // different pair, miss
  t.equal(instance.called, 7);
});

test("@memoize caches values at the instance level", (t) => {
  class MyClass {
    public called: number;
    public secret: number;

    public constructor(secret: number) {
      this.called = 0;
      this.secret = secret;
    }

    @Cache.memoize
    public doStuff(foo: Foo, bar: Bar): number {
      this.called++;

      return this.secret + foo.x + bar.y.length;
    }
  }

  const instanceA = new MyClass(1);
  const instanceB = new MyClass(10);

  // instanceA
  t.equal(instanceA.called, 0);
  t.equal(instanceA.doStuff(zero, a), 2); // Initial call, miss
  t.equal(instanceA.called, 1);
  t.equal(instanceA.doStuff(zero, a), 2); // hit
  t.equal(instanceA.called, 1);
  // An extra call to make the number different from B after first call.
  t.equal(instanceA.doStuff(one, a), 3); // miss
  t.equal(instanceA.called, 2);

  // instanceB
  t.equal(instanceB.called, 0);
  t.equal(instanceB.doStuff(zero, a), 11); // Initial call, miss
  t.equal(instanceB.called, 1);
  t.equal(instanceB.doStuff(zero, a), 11); // hit
  t.equal(instanceB.called, 1);
});

test("memoize() caches a recursive function when used correctly", (t) => {
  type Foo = { x: number; y: Foo | undefined };
  const zero: Foo = { x: 0, y: undefined };
  const one: Foo = { x: 1, y: zero };
  const two: Foo = { x: 2, y: one };
  const three: Foo = { x: 3, y: two };

  let called = 0;

  const memoized = Cache.memoize(function (foo: Foo): number {
    called++;

    return foo.x + (foo.y ? memoized(foo.y) : 0);
  });

  t.equal(called, 0);

  // Initial call, fills the cache for all values it recurses on
  t.equal(memoized(three), 6);
  t.equal(called, 4);

  // Same call, gets the result immediately
  t.equal(memoized(three), 6);
  t.equal(called, 4);

  // Call on a sub-object, the cache was still correctly filled.
  t.equal(memoized(two), 3);
  t.equal(called, 4);
});

test("memoize() does not fully cache a recursive function when used incorrectly", (t) => {
  type Foo = { x: number; y: Foo | undefined };
  const zero: Foo = { x: 0, y: undefined };
  const one: Foo = { x: 1, y: zero };
  const two: Foo = { x: 2, y: one };
  const three: Foo = { x: 3, y: two };

  let called = 0;

  function sum(foo: Foo): number {
    called++;

    return foo.x + (foo.y ? sum(foo.y) : 0);
  }
  const memoized = Cache.memoize(sum);

  t.equal(called, 0);

  // Initial call, fills the cache for all values it recurses on
  t.equal(memoized(three), 6);
  t.equal(called, 4);

  // Same call, gets the result immediately
  t.equal(memoized(three), 6);
  t.equal(called, 4);

  // Call on a sub-object, the cache was not filled since the recursion was
  // done on the original function.
  t.equal(memoized(two), 3);
  t.equal(called, 7);
});
