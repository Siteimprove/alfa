import { test } from "@siteimprove/alfa-test";

import { None, Option } from "@siteimprove/alfa-option";

import { MutableMap } from "../dist/mutable-map.js";

function stringMap() {
  return MutableMap.of(["foo", 1], ["bar", 2], ["baz", 3], ["qux", 4]);
}

function numberMap() {
  return MutableMap.of([1, "one"], [2, "two"], [3, "three"], [4, "four"]);
}

function booleanMap() {
  return MutableMap.of([true, "yes"], [false, "no"]);
}

test(".empty() constructs an empty map", (t) => {
  t.deepEqual([...MutableMap.empty()], []);
});

test(".empty() creates a new instance", (t) => {
  t.notEqual(MutableMap.empty(), MutableMap.empty());
});

test(".of() constructs a map from entries with string keys", (t) => {
  const map = MutableMap.of(["a", 1], ["b", 2]);
  t.equal(map.size, 2);
  t.equal(map.get("a").getUnsafe(), 1);
  t.equal(map.get("b").getUnsafe(), 2);
});

test(".of() constructs a map from entries with number keys", (t) => {
  const map = MutableMap.of([1, "a"], [2, "b"]);
  t.equal(map.size, 2);
  t.equal(map.get(1).getUnsafe(), "a");
  t.equal(map.get(2).getUnsafe(), "b");
});

test(".of() constructs a map from entries with boolean keys", (t) => {
  const map = MutableMap.of([true, 1], [false, 0]);
  t.equal(map.size, 2);
  t.equal(map.get(true).getUnsafe(), 1);
  t.equal(map.get(false).getUnsafe(), 0);
});

test("#size returns the size of a map", (t) => {
  t.equal(stringMap().size, 4);
});

test("#isEmpty() returns true for empty maps", (t) => {
  t(MutableMap.empty().isEmpty());
});

test("#isEmpty() returns false for non-empty maps", (t) => {
  t(!stringMap().isEmpty());
});

test("#map() applies a function to each value of a map", (t) => {
  const result = stringMap().map((x) => x * 2);
  t.deepEqual([...result].sort(), [
    ["bar", 4],
    ["baz", 6],
    ["foo", 2],
    ["qux", 8],
  ]);
});

test("#apply() applies a map of functions to each corresponding value of a map", (t) => {
  const result = stringMap().apply(
    MutableMap.of(
      ["foo", (x: number) => x + 1],
      ["bar", (x) => x * 2],
      ["baz", (x) => x - 3],
      ["qux", (x) => x / 4],
    ),
  );
  t.deepEqual([...result].sort(), [
    ["bar", 4],
    ["baz", 0],
    ["foo", 2],
    ["qux", 1],
  ]);
});

test("#apply() drops keys with no corresponding function or value", (t) => {
  const result = stringMap().apply(
    MutableMap.of<string, (x: number) => number>(
      ["foo", (x: number) => x + 1],
      ["missing", (x) => x * 2],
    ),
  );
  t.deepEqual([...result], [["foo", 2]]);
});

test("#flatMap() applies a function to each value of a map and flattens the result", (t) => {
  const result = stringMap().flatMap((x) =>
    MutableMap.of<string, number>([x.toString(), x], [`${x}-copy`, x]),
  );
  t.equal(result.size, 8);
  t.equal(result.get("1").getUnsafe(), 1);
  t.equal(result.get("1-copy").getUnsafe(), 1);
});

test("#flatten() flattens a nested map", (t) => {
  const nested: MutableMap<string, MutableMap<string, number>> = MutableMap.of(
    ["a", MutableMap.of(["x", 1], ["y", 2])],
    ["b", MutableMap.of(["z", 3])],
  );
  const result = nested.flatten();
  t.equal(result.size, 3);
  t.equal(result.get("x").getUnsafe(), 1);
  t.equal(result.get("y").getUnsafe(), 2);
  t.equal(result.get("z").getUnsafe(), 3);
});

test("#filter() filters values based on a predicate", (t) => {
  const result = stringMap().filter((x) => x > 2);
  t.deepEqual([...result].sort(), [
    ["baz", 3],
    ["qux", 4],
  ]);
});

test("#reject() rejects values based on a predicate", (t) => {
  const result = stringMap().reject((x) => x > 2);
  t.deepEqual([...result].sort(), [
    ["bar", 2],
    ["foo", 1],
  ]);
});

test("#find() finds the first value matching a predicate", (t) => {
  const result = stringMap().find((x) => x > 2);
  t(result.isSome());
  t(result.getUnsafe() === 3 || result.getUnsafe() === 4);
});

test("#find() returns none if no value matches", (t) => {
  const result = stringMap().find((x) => x > 10);
  t(result.isNone());
});

test("#includes() returns true if a value exists", (t) => {
  t(stringMap().includes(2));
});

test("#includes() returns false if a value does not exist", (t) => {
  t(!stringMap().includes(10));
});

test("#collect() maps and filters in one operation", (t) => {
  const result = stringMap().collect((x) => (x > 2 ? Option.of(x * 10) : None));
  t.equal(result.size, 2);
});

test("#collectFirst() returns the first mapped value", (t) => {
  const result = stringMap().collectFirst((x) =>
    x > 2 ? Option.of(x * 10) : None,
  );
  t(result.isSome());
});

test("#some() returns true if any value matches", (t) => {
  t(stringMap().some((x) => x > 3));
});

test("#some() returns false if no value matches", (t) => {
  t(!stringMap().some((x) => x > 10));
});

test("#none() returns true if no value matches", (t) => {
  t(stringMap().none((x) => x > 10));
});

test("#none() returns false if any value matches", (t) => {
  t(!stringMap().none((x) => x > 3));
});

test("#every() returns true if all values match", (t) => {
  t(stringMap().every((x) => x > 0));
});

test("#every() returns false if not all values match", (t) => {
  t(!stringMap().every((x) => x > 2));
});

test("#count() counts values matching a predicate", (t) => {
  t.equal(
    stringMap().count((x) => x > 2),
    2,
  );
});

test("#distinct() removes duplicate values from a map", (t) => {
  const map = MutableMap.of(
    ["a", 1],
    ["b", 1],
    ["c", 1],
    ["d", 2],
    ["e", 3],
    ["f", 3],
  );
  const result = map.distinct();
  t.equal(result.size, 3);
  t(result.includes(1));
  t(result.includes(2));
  t(result.includes(3));
});

test("#has() returns true if a key exists in a map with string keys", (t) => {
  t(stringMap().has("foo"));
});

test("#has() returns false if a key does not exist in a map with string keys", (t) => {
  t(!stringMap().has("missing"));
});

test("#has() returns true if a key exists in a map with number keys", (t) => {
  t(numberMap().has(1));
});

test("#has() returns false if a key does not exist in a map with number keys", (t) => {
  t(!numberMap().has(10));
});

test("#has() returns true if a key exists in a map with boolean keys", (t) => {
  t(booleanMap().has(true));
  t(booleanMap().has(false));
});

test("#get() returns the value of a key in a map with string keys", (t) => {
  t.equal(stringMap().get("foo").getUnsafe(), 1);
});

test("#get() returns none if a key does not exist in a map with string keys", (t) => {
  t(stringMap().get("missing").isNone());
});

test("#get() returns the value of a key in a map with number keys", (t) => {
  t.equal(numberMap().get(1).getUnsafe(), "one");
});

test("#get() returns none if a key does not exist in a map with number keys", (t) => {
  t(numberMap().get(10).isNone());
});

test("#get() returns the value of a key in a map with boolean keys", (t) => {
  t.equal(booleanMap().get(true).getUnsafe(), "yes");
  t.equal(booleanMap().get(false).getUnsafe(), "no");
});

test("#get() returns none when a map is empty", (t) => {
  t(MutableMap.empty<string, number>().get("foo").isNone());
});

test("#set() sets the value of a key already in a map", (t) => {
  const result = stringMap().set("foo", 42);
  t.equal(result.get("foo").getUnsafe(), 42);
  t.equal(result.size, 4);
});

test("#set() sets the value of a key not yet in a map", (t) => {
  const result = stringMap().set("new", 5);
  t.equal(result.get("new").getUnsafe(), 5);
  t.equal(result.size, 5);
});

test("#set() returns a new instance", (t) => {
  const result = stringMap().set("new", 5);
  t.notEqual(result, stringMap());
  t(!stringMap().has("new"));
});

test("#set() works with number keys", (t) => {
  const result = numberMap().set(5, "five");
  t.equal(result.get(5).getUnsafe(), "five");
  t.equal(result.size, 5);
});

test("#set() works with boolean keys", (t) => {
  const result = booleanMap().set(true, "YES");
  t.equal(result.get(true).getUnsafe(), "YES");
  t.equal(result.size, 2);
});

test("#delete() removes a key from a map by mutating it", (t) => {
  const theMap = stringMap();
  const result = theMap.delete("foo");
  t(!result.has("foo"));
  t.equal(result, theMap);
});

test("#delete() returns the same instance when a key is not in a map", (t) => {
  const theMap = stringMap();
  const result = theMap.delete("missing");
  t.equal(result, theMap);
});

test("#delete() works with number keys", (t) => {
  const result = numberMap().delete(1);
  t(!result.has(1));
  t.equal(result.size, 3);
});

test("#delete() works with boolean keys", (t) => {
  const result = booleanMap().delete(true);
  t(!result.has(true));
  t.equal(result.size, 1);
});

test("#delete() returns the same instance when deleting from an empty map", (t) => {
  const empty = MutableMap.empty<string, number>();
  t.equal(empty.delete("foo"), empty);
});

test("#concat() concatenates two maps", (t) => {
  const result = stringMap().concat(
    MutableMap.of<string, number>(["new", 5], ["foo", 99]),
  );
  t.equal(result.size, 5);
  t.equal(result.get("new").getUnsafe(), 5);
  t.equal(result.get("foo").getUnsafe(), 99); // overwrites
});

test("#subtract() removes keys from a map", (t) => {
  const result = stringMap().subtract(
    MutableMap.of<string, number>(["foo", 1], ["bar", 2]),
  );
  t.equal(result.size, 2);
  t(!result.has("foo"));
  t(!result.has("bar"));
  t(result.has("baz"));
  t(result.has("qux"));
});

test("#intersect() keeps only keys present in both maps", (t) => {
  const result = stringMap().intersect(
    MutableMap.of<string, number>(["foo", 10], ["bar", 20], ["missing", 30]),
  );
  t.equal(result.size, 2);
  t.equal(result.get("foo").getUnsafe(), 10); // uses value from argument
  t.equal(result.get("bar").getUnsafe(), 20);
  t(!result.has("baz"));
  t(!result.has("qux"));
});

test("#tee() calls a callback and returns the same instance", (t) => {
  const theMap = stringMap();
  let called = false;
  const result = theMap.tee((map) => {
    called = true;
    t.equal(map, theMap);
  });
  t(called);
  t.equal(result, theMap);
});

test("#equals() returns true for equal maps", (t) => {
  const map1 = MutableMap.of(["a", 1], ["b", 2]);
  const map2 = MutableMap.of(["a", 1], ["b", 2]);
  t(map1.equals(map2));
});

test("#equals() returns false for maps with different sizes", (t) => {
  const map1 = MutableMap.of(["a", 1], ["b", 2]);
  const map2 = MutableMap.of(["a", 1]);
  t(!map1.equals(map2));
});

test("#equals() returns false for maps with different keys", (t) => {
  const map1 = MutableMap.of(["a", 1], ["b", 2]);
  const map2 = MutableMap.of(["a", 1], ["c", 2]);
  t(!map1.equals(map2));
});

test("#equals() returns false for maps with different values", (t) => {
  const map1 = MutableMap.of(["a", 1], ["b", 2]);
  const map2 = MutableMap.of(["a", 1], ["b", 3]);
  t(!map1.equals(map2));
});

test("#equals() returns false for non-MutableMap values", (t) => {
  t(!stringMap().equals({}));
  t(!stringMap().equals([]));
  t(!stringMap().equals(null));
});

test("#keys() returns an iterable of keys", (t) => {
  const keys = [...stringMap().keys()].sort();
  t.deepEqual(keys, ["bar", "baz", "foo", "qux"]);
});

test("#values() returns an iterable of values", (t) => {
  const values = [...stringMap().values()].sort();
  t.deepEqual(values, [1, 2, 3, 4]);
});

test("#iterator() returns an iterator of entries", (t) => {
  const entries = [...stringMap()].sort();
  t.equal(entries.length, 4);
});

test("#[Symbol.iterator]() returns an iterator of entries", (t) => {
  const entries = [...stringMap()].sort();
  t.equal(entries.length, 4);
});

test("#toArray() returns an array of entries", (t) => {
  const array = stringMap().toArray();
  t.equal(array.length, 4);
  t(Array.isArray(array));
});

test("#toJSON() serializes the map to JSON", (t) => {
  const json = stringMap().toJSON();
  t.equal(json.length, 4);
  t(Array.isArray(json));
});

test("#toString() returns a string representation", (t) => {
  const str = MutableMap.of(["a", 1]).toString();
  t.equal(str, "MutableMap { a => 1 }");
});

test("#toString() returns empty braces for empty maps", (t) => {
  const str = MutableMap.empty().toString();
  t.equal(str, "MutableMap {}");
});

test(".isMutableMap() returns true for MutableMap instances", (t) => {
  t(MutableMap.isMutableMap(stringMap()));
});

test(".isMutableMap() returns false for non-MutableMap values", (t) => {
  t(!MutableMap.isMutableMap({}));
  t(!MutableMap.isMutableMap([]));
  t(!MutableMap.isMutableMap(new Map()));
});

test(".from() creates a MutableMap from an iterable", (t) => {
  const map = MutableMap.from([
    ["a", 1],
    ["b", 2],
  ]);
  t.equal(map.size, 2);
  t.equal(map.get("a").getUnsafe(), 1);
});

test(".from() returns the same instance if already a MutableMap", (t) => {
  const oldMap = stringMap();
  const result = MutableMap.from(oldMap);
  t.equal(result, oldMap);
});

test(".fromArray() creates a MutableMap from an array", (t) => {
  const map = MutableMap.fromArray([
    ["a", 1],
    ["b", 2],
  ]);
  t.equal(map.size, 2);
  t.equal(map.get("a").getUnsafe(), 1);
});

test(".fromIterable() creates a MutableMap from an iterable", (t) => {
  const iterable = (function* () {
    yield ["a", 1] as const;
    yield ["b", 2] as const;
  })();
  const map = MutableMap.fromIterable(iterable);
  t.equal(map.size, 2);
  t.equal(map.get("a").getUnsafe(), 1);
});

test("#reduce() reduces values to a single value", (t) => {
  const sum = stringMap().reduce((acc, value) => acc + value, 0);
  t.equal(sum, 10);
});

test("#reduce() passes keys to the reducer", (t) => {
  const keys: string[] = [];
  stringMap().reduce((acc, _, key) => {
    keys.push(key);
    return acc;
  }, 0);
  t.equal(keys.length, 4);
});

test("#forEach() calls a callback for each entry", (t) => {
  let count = 0;
  stringMap().forEach(() => {
    count++;
  });
  t.equal(count, 4);
});

test("#forEach() passes value and key to the callback", (t) => {
  const entries: Array<[string, number]> = [];
  stringMap().forEach((value, key) => {
    entries.push([key, value]);
  });
  t.equal(entries.length, 4);
});

test("MutableMap.set mutates the map and returns the same instance", (t) => {
  const original: MutableMap<string, number> = MutableMap.of(
    ["a", 1],
    ["b", 2],
  );
  const modified = original.set("c", 3);

  t.equal(original, modified);
  t.equal(original.size, 3);
  t(original.has("c"));
});

test("MutableMap works with mixed key types in different instances", (t) => {
  const strMap = MutableMap.of(["a", 1]);
  const numMap = MutableMap.of([1, "a"]);
  const boolMap = MutableMap.of([true, "yes"]);

  t.equal(strMap.get("a").getUnsafe(), 1);
  t.equal(numMap.get(1).getUnsafe(), "a");
  t.equal(boolMap.get(true).getUnsafe(), "yes");
});

test("MutableMap handles zero as a number key correctly", (t) => {
  const map = MutableMap.of([0, "zero"], [1, "one"]);
  t(map.has(0));
  t.equal(map.get(0).getUnsafe(), "zero");
});

test("MutableMap handles empty string as a key correctly", (t) => {
  const map = MutableMap.of(["", "empty"], ["a", "not empty"]);
  t(map.has(""));
  t.equal(map.get("").getUnsafe(), "empty");
});

test("MutableMap handles negative numbers as keys correctly", (t) => {
  const map = MutableMap.of([-1, "negative"], [1, "positive"]);
  t(map.has(-1));
  t.equal(map.get(-1).getUnsafe(), "negative");
});
