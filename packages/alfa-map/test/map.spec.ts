import { test } from "@siteimprove/alfa-test";

import { Hash } from "@siteimprove/alfa-hash";

import { Map } from "../src/map";

const map = Map.of(["foo", 1], ["bar", 2], ["baz", 3], ["qux", 4]);

function key(id: number) {
  const self = {
    equals(value: unknown): boolean {
      return value === self;
    },

    hash(hash: Hash): void {
      Hash.writeNumber(hash, id);
    },
  };

  return self;
}

test(".empty() constructs an empty map", (t) => {
  t.deepEqual([...Map.empty()], []);
});

test(".empty() always returns the same reference", (t) => {
  t.equal(Map.empty(), Map.empty());
});

test("#size returns the size of a map", (t) => {
  t.equal(map.size, 4);
});

test("#distinct() removes duplicate values from a map", (t) => {
  t.deepEqual(
    [
      ...Map.of(
        ["a", 1],
        ["b", 1],
        ["c", 1],
        ["d", 2],
        ["e", 3],
        ["f", 3]
      ).distinct(),
    ],
    [
      ["e", 3],
      ["b", 1],
      ["d", 2],
    ]
  );
});

test("#has() returns true if a key exists in a map", (t) => {
  t(map.has("foo"));
});

test("#has() returns false if a key does not exist in a map", (t) => {
  t(!map.has("fez"));
});

test("#get() returns the value of a key in a map", (t) => {
  t.equal(map.get("foo").get(), 1);
});

test("#get() returns none if a key does not exist in a map", (t) => {
  t(map.get("fez").isNone());
});

test("#get() returns none if a key does not exist in a singleton map", (t) => {
  t(Map.of(["foo", 1]).get("fez").isNone());
});

test("#get() returns none when a map if empty", (t) => {
  t(Map.empty<string, number>().get("foo").isNone());
});

test("#get() behaves when getting a colliding key in a map", (t) => {
  const foo = key(0);
  const bar = key(0);

  const map = Map.of([foo, 1], [bar, 2]);

  t.equal(map.get(foo).get(), 1);
});

test("#get() behaves when getting a non-colliding key in a colliding map", (t) => {
  const foo = key(0);
  const bar = key(0);
  const baz = key(1);

  const map = Map.of([foo, 1], [bar, 2]);

  t(map.get(baz).isNone());
});

test("#get() behaves when getting a colliding key that does not exist in a map", (t) => {
  const foo = key(0);
  const bar = key(0);
  const baz = key(0);

  const map = Map.of([foo, 1], [bar, 2]);

  t(map.get(baz).isNone());
});

test("#set() sets the value of a key already in a map", (t) => {
  t.deepEqual(
    [...map.set("foo", 42)],
    [
      ["baz", 3],
      ["qux", 4],
      ["foo", 42],
      ["bar", 2],
    ]
  );
});

test("#set() sets the value of a key not yet in a map", (t) => {
  t.deepEqual(
    [...map.set("fez", 5)],
    [
      ["baz", 3],
      ["qux", 4],
      ["fez", 5],
      ["foo", 1],
      ["bar", 2],
    ]
  );
});

test("#set() does nothing when setting the same value of a key", (t) => {
  t.equal(map.set("foo", 1), map);
});

test("#set() behaves when adding a colliding key", (t) => {
  const foo = key(0);
  const bar = key(0);

  const map = Map.of([foo, 1]);

  t.deepEqual(
    [...map.set(bar, 2)],
    [
      [foo, 1],
      [bar, 2],
    ]
  );
});

test("#set() behaves when adding a key to an already colliding map", (t) => {
  const foo = key(0);
  const bar = key(0);
  const baz = key(1);

  const map = Map.of([foo, 1], [bar, 2]);

  t.deepEqual(
    [...map.set(baz, 3)],
    [
      [baz, 3],
      [foo, 1],
      [bar, 2],
    ]
  );
});

test("#set() behaves when adding a colliding key to an already colliding map", (t) => {
  const foo = key(0);
  const bar = key(0);
  const baz = key(0);

  const map = Map.of([foo, 1], [bar, 2]);

  t.deepEqual(
    [...map.set(baz, 3)],
    [
      [foo, 1],
      [bar, 2],
      [baz, 3],
    ]
  );
});

test("#set() behaves when updating a colliding key in an already colliding map", (t) => {
  const foo = key(0);
  const bar = key(0);
  const baz = key(0);

  const map = Map.of([foo, 1], [bar, 2], [baz, 3]);

  t.deepEqual(
    [...map.set(baz, 42)],
    [
      [foo, 1],
      [bar, 2],
      [baz, 42],
    ]
  );
});

test("#set() does nothing when setting the same value of a colliding key", (t) => {
  const foo = key(0);
  const bar = key(0);

  const map = Map.of([foo, 1], [bar, 2]);

  t.equal(map.set(foo, 1), map);
});

test("#delete() removes a key from a map", (t) => {
  t.deepEqual(
    [...map.delete("foo")],
    [
      ["baz", 3],
      ["qux", 4],
      ["bar", 2],
    ]
  );
});

test("#delete() does nothing when a key is not in a map", (t) => {
  t.equal(map.delete("fez"), map);
});

test("#delete() does nothing when a key is not in a singleton map", (t) => {
  const map = Map.of(["foo", 1]);

  t.equal(map.delete("fez"), map);
});

test("#delete() does nothing when deleting from an empty map", (t) => {
  const map = Map.empty<string, number>();

  t.equal(map.delete("fez"), map);
});

test("#delete() behaves when deleting a colliding key", (t) => {
  const foo = key(0);
  const bar = key(0);
  const baz = key(0);

  const map = Map.of([foo, 1], [bar, 2], [baz, 3]);

  t.deepEqual(
    [...map.delete(baz)],
    [
      [foo, 1],
      [bar, 2],
    ]
  );
});

test("#delete() behaves when deleting the last colliding key in a map", (t) => {
  const foo = key(0);
  const bar = key(0);

  const map = Map.of([foo, 1], [bar, 2]);

  t.deepEqual([...map.delete(bar)], [[foo, 1]]);
});

test("#delete() does nothing when deleting a colliding key that is not in a map", (t) => {
  const foo = key(0);
  const bar = key(0);
  const baz = key(0);

  const map = Map.of([foo, 1], [bar, 2]);

  t.equal(map.delete(baz), map);
});

test("#delete() does nothing when deleting a colliding key not in a sparse map", (t) => {
  const foo = key(0);
  const bar = key(0);
  const baz = key(1);
  const qux = key(1);

  const map = Map.of([foo, 1], [bar, 2], [baz, 3]);

  t.equal(map.delete(qux), map);
});

test("#delete() behaves when deleting a key in a sparse map", (t) => {
  const map = Map.of(["foo", 1], ["bar", 2], ["baz", 3]);

  t.deepEqual(
    [...map.delete("baz")],
    [
      ["foo", 1],
      ["bar", 2],
    ]
  );

  t.deepEqual([...map.delete("baz").delete("bar")], [["foo", 1]]);
});

test("#delete() behaves when deleting a key in a sparse map with collisions", (t) => {
  const foo = key(0);
  const bar = key(0);
  const baz = key(1);

  const map = Map.of([foo, 1], [bar, 2], [baz, 3]);

  t.deepEqual(
    [...map.delete(foo)],
    [
      [baz, 3],
      [bar, 2],
    ]
  );
});

test("#size is correctly reported when sparse nodes are branched", (t) => {
  const foo = key(100);
  const bar = key(9178623);

  const map = Map.of([foo, 1], [bar, 2]);

  t.equal(map.size, 2);
});
