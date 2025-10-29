import { test } from "@siteimprove/alfa-test";

import { None, Option } from "@siteimprove/alfa-option";

import { ValueMap } from "../dist/value-map.js";

const stringMap: ValueMap<string, number> = ValueMap.of(
  ["foo", 1],
  ["bar", 2],
  ["baz", 3],
  ["qux", 4],
);

const numberMap: ValueMap<number, string> = ValueMap.of(
  [1, "one"],
  [2, "two"],
  [3, "three"],
  [4, "four"],
);

const booleanMap: ValueMap<boolean, string> = ValueMap.of(
  [true, "yes"],
  [false, "no"],
);

test(".empty() constructs an empty map", (t) => {
  t.deepEqual([...ValueMap.empty()], []);
});

test(".empty() always returns the same reference", (t) => {
  t.equal(ValueMap.empty(), ValueMap.empty());
});

test(".of() constructs a map from entries with string keys", (t) => {
  const map = ValueMap.of(["a", 1], ["b", 2]);
  t.equal(map.size, 2);
  t.equal(map.get("a").getUnsafe(), 1);
  t.equal(map.get("b").getUnsafe(), 2);
});

test(".of() constructs a map from entries with number keys", (t) => {
  const map = ValueMap.of([1, "a"], [2, "b"]);
  t.equal(map.size, 2);
  t.equal(map.get(1).getUnsafe(), "a");
  t.equal(map.get(2).getUnsafe(), "b");
});

test(".of() constructs a map from entries with boolean keys", (t) => {
  const map = ValueMap.of([true, 1], [false, 0]);
  t.equal(map.size, 2);
  t.equal(map.get(true).getUnsafe(), 1);
  t.equal(map.get(false).getUnsafe(), 0);
});

test("#size returns the size of a map", (t) => {
  t.equal(stringMap.size, 4);
  t.equal(numberMap.size, 4);
  t.equal(booleanMap.size, 2);
});

test("#isEmpty() returns true for empty maps", (t) => {
  t(ValueMap.empty().isEmpty());
});

test("#isEmpty() returns false for non-empty maps", (t) => {
  t(!stringMap.isEmpty());
});

test("#map() applies a function to each value of a map", (t) => {
  const result = stringMap.map((x) => x * 2);
  t.deepEqual(
    [...result].sort(),
    [
      ["bar", 4],
      ["baz", 6],
      ["foo", 2],
      ["qux", 8],
    ],
  );
});

test("#apply() applies a map of functions to each corresponding value of a map", (t) => {
  const result = stringMap.apply(
    ValueMap.of(
      ["foo", (x: number) => x + 1],
      ["bar", (x) => x * 2],
      ["baz", (x) => x - 3],
      ["qux", (x) => x / 4],
    ),
  );
  t.deepEqual(
    [...result].sort(),
    [
      ["bar", 4],
      ["baz", 0],
      ["foo", 2],
      ["qux", 1],
    ],
  );
});

test("#apply() drops keys with no corresponding function or value", (t) => {
  const result = stringMap.apply(
    ValueMap.of<string, (x: number) => number>(
      ["foo", (x: number) => x + 1],
      ["missing", (x) => x * 2],
    ),
  );
  t.deepEqual([...result], [["foo", 2]]);
});

test("#flatMap() applies a function to each value of a map and flattens the result", (t) => {
  const result = stringMap.flatMap((x) =>
    ValueMap.of<string, number>([x.toString(), x], [`${x}-copy`, x]),
  );
  t.equal(result.size, 8);
  t.equal(result.get("1").getUnsafe(), 1);
  t.equal(result.get("1-copy").getUnsafe(), 1);
});

test("#flatten() flattens a nested map", (t) => {
  const nested: ValueMap<string, ValueMap<string, number>> = ValueMap.of(
    ["a", ValueMap.of(["x", 1], ["y", 2])],
    ["b", ValueMap.of(["z", 3])],
  );
  const result = nested.flatten();
  t.equal(result.size, 3);
  t.equal(result.get("x").getUnsafe(), 1);
  t.equal(result.get("y").getUnsafe(), 2);
  t.equal(result.get("z").getUnsafe(), 3);
});

test("#filter() filters values based on a predicate", (t) => {
  const result = stringMap.filter((x) => x > 2);
  t.deepEqual(
    [...result].sort(),
    [
      ["baz", 3],
      ["qux", 4],
    ],
  );
});

test("#reject() rejects values based on a predicate", (t) => {
  const result = stringMap.reject((x) => x > 2);
  t.deepEqual(
    [...result].sort(),
    [
      ["bar", 2],
      ["foo", 1],
    ],
  );
});

test("#find() finds the first value matching a predicate", (t) => {
  const result = stringMap.find((x) => x > 2);
  t(result.isSome());
  t(result.getUnsafe() === 3 || result.getUnsafe() === 4);
});

test("#find() returns none if no value matches", (t) => {
  const result = stringMap.find((x) => x > 10);
  t(result.isNone());
});

test("#includes() returns true if a value exists", (t) => {
  t(stringMap.includes(2));
});

test("#includes() returns false if a value does not exist", (t) => {
  t(!stringMap.includes(10));
});

test("#collect() maps and filters in one operation", (t) => {
  const result = stringMap.collect((x) =>
    x > 2 ? Option.of(x * 10) : None,
  );
  t.equal(result.size, 2);
});

test("#collectFirst() returns the first mapped value", (t) => {
  const result = stringMap.collectFirst((x) =>
    x > 2 ? Option.of(x * 10) : None,
  );
  t(result.isSome());
});

test("#some() returns true if any value matches", (t) => {
  t(stringMap.some((x) => x > 3));
});

test("#some() returns false if no value matches", (t) => {
  t(!stringMap.some((x) => x > 10));
});

test("#none() returns true if no value matches", (t) => {
  t(stringMap.none((x) => x > 10));
});

test("#none() returns false if any value matches", (t) => {
  t(!stringMap.none((x) => x > 3));
});

test("#every() returns true if all values match", (t) => {
  t(stringMap.every((x) => x > 0));
});

test("#every() returns false if not all values match", (t) => {
  t(!stringMap.every((x) => x > 2));
});

test("#count() counts values matching a predicate", (t) => {
  t.equal(stringMap.count((x) => x > 2), 2);
});

test("#distinct() removes duplicate values from a map", (t) => {
  const map = ValueMap.of(
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
  t(stringMap.has("foo"));
});

test("#has() returns false if a key does not exist in a map with string keys", (t) => {
  t(!stringMap.has("missing"));
});

test("#has() returns true if a key exists in a map with number keys", (t) => {
  t(numberMap.has(1));
});

test("#has() returns false if a key does not exist in a map with number keys", (t) => {
  t(!numberMap.has(10));
});

test("#has() returns true if a key exists in a map with boolean keys", (t) => {
  t(booleanMap.has(true));
  t(booleanMap.has(false));
});

test("#get() returns the value of a key in a map with string keys", (t) => {
  t.equal(stringMap.get("foo").getUnsafe(), 1);
});

test("#get() returns none if a key does not exist in a map with string keys", (t) => {
  t(stringMap.get("missing").isNone());
});

test("#get() returns the value of a key in a map with number keys", (t) => {
  t.equal(numberMap.get(1).getUnsafe(), "one");
});

test("#get() returns none if a key does not exist in a map with number keys", (t) => {
  t(numberMap.get(10).isNone());
});

test("#get() returns the value of a key in a map with boolean keys", (t) => {
  t.equal(booleanMap.get(true).getUnsafe(), "yes");
  t.equal(booleanMap.get(false).getUnsafe(), "no");
});

test("#get() returns none when a map is empty", (t) => {
  t(ValueMap.empty<string, number>().get("foo").isNone());
});

test("#set() sets the value of a key already in a map", (t) => {
  const result = stringMap.set("foo", 42);
  t.equal(result.get("foo").getUnsafe(), 42);
  t.equal(result.size, 4);
});

test("#set() sets the value of a key not yet in a map", (t) => {
  const result = stringMap.set("new", 5);
  t.equal(result.get("new").getUnsafe(), 5);
  t.equal(result.size, 5);
});

test("#set() returns a new instance", (t) => {
  const result = stringMap.set("new", 5);
  t.notEqual(result, stringMap);
  t(!stringMap.has("new"));
});

test("#set() works with number keys", (t) => {
  const result = numberMap.set(5, "five");
  t.equal(result.get(5).getUnsafe(), "five");
  t.equal(result.size, 5);
});

test("#set() works with boolean keys", (t) => {
  const result = booleanMap.set(true, "YES");
  t.equal(result.get(true).getUnsafe(), "YES");
  t.equal(result.size, 2);
});

test("#delete() removes a key from a map", (t) => {
  const result = stringMap.delete("foo");
  t(!result.has("foo"));
  t.equal(result.size, 3);
});

test("#delete() returns the same instance when a key is not in a map", (t) => {
  const result = stringMap.delete("missing");
  t.equal(result, stringMap);
});

test("#delete() works with number keys", (t) => {
  const result = numberMap.delete(1);
  t(!result.has(1));
  t.equal(result.size, 3);
});

test("#delete() works with boolean keys", (t) => {
  const result = booleanMap.delete(true);
  t(!result.has(true));
  t.equal(result.size, 1);
});

test("#delete() returns the same instance when deleting from an empty map", (t) => {
  const empty = ValueMap.empty<string, number>();
  t.equal(empty.delete("foo"), empty);
});

test("#concat() concatenates two maps", (t) => {
  const result = stringMap.concat(
    ValueMap.of<string, number>(["new", 5], ["foo", 99]),
  );
  t.equal(result.size, 5);
  t.equal(result.get("new").getUnsafe(), 5);
  t.equal(result.get("foo").getUnsafe(), 99); // overwrites
});

test("#subtract() removes keys from a map", (t) => {
  const result = stringMap.subtract(
    ValueMap.of<string, number>(["foo", 1], ["bar", 2]),
  );
  t.equal(result.size, 2);
  t(!result.has("foo"));
  t(!result.has("bar"));
  t(result.has("baz"));
  t(result.has("qux"));
});

test("#intersect() keeps only keys present in both maps", (t) => {
  const result = stringMap.intersect(
    ValueMap.of<string, number>(
      ["foo", 10],
      ["bar", 20],
      ["missing", 30],
    ),
  );
  t.equal(result.size, 2);
  t.equal(result.get("foo").getUnsafe(), 10); // uses value from argument
  t.equal(result.get("bar").getUnsafe(), 20);
  t(!result.has("baz"));
  t(!result.has("qux"));
});

test("#tee() calls a callback and returns the same instance", (t) => {
  let called = false;
  const result = stringMap.tee((map) => {
    called = true;
    t.equal(map, stringMap);
  });
  t(called);
  t.equal(result, stringMap);
});

test("#equals() returns true for equal maps", (t) => {
  const map1 = ValueMap.of(["a", 1], ["b", 2]);
  const map2 = ValueMap.of(["a", 1], ["b", 2]);
  t(map1.equals(map2));
});

test("#equals() returns false for maps with different sizes", (t) => {
  const map1 = ValueMap.of(["a", 1], ["b", 2]);
  const map2 = ValueMap.of(["a", 1]);
  t(!map1.equals(map2));
});

test("#equals() returns false for maps with different keys", (t) => {
  const map1 = ValueMap.of(["a", 1], ["b", 2]);
  const map2 = ValueMap.of(["a", 1], ["c", 2]);
  t(!map1.equals(map2));
});

test("#equals() returns false for maps with different values", (t) => {
  const map1 = ValueMap.of(["a", 1], ["b", 2]);
  const map2 = ValueMap.of(["a", 1], ["b", 3]);
  t(!map1.equals(map2));
});

test("#equals() returns false for non-ValueMap values", (t) => {
  t(!stringMap.equals({}));
  t(!stringMap.equals([]));
  t(!stringMap.equals(null));
});

test("#keys() returns an iterable of keys", (t) => {
  const keys = [...stringMap.keys()].sort();
  t.deepEqual(keys, ["bar", "baz", "foo", "qux"]);
});

test("#values() returns an iterable of values", (t) => {
  const values = [...stringMap.values()].sort();
  t.deepEqual(values, [1, 2, 3, 4]);
});

test("#iterator() returns an iterator of entries", (t) => {
  const entries = [...stringMap].sort();
  t.equal(entries.length, 4);
});

test("#[Symbol.iterator]() returns an iterator of entries", (t) => {
  const entries = [...stringMap].sort();
  t.equal(entries.length, 4);
});

test("#toArray() returns an array of entries", (t) => {
  const array = stringMap.toArray();
  t.equal(array.length, 4);
  t(Array.isArray(array));
});

test("#toJSON() serializes the map to JSON", (t) => {
  const json = stringMap.toJSON();
  t.equal(json.length, 4);
  t(Array.isArray(json));
});

test("#toString() returns a string representation", (t) => {
  const str = ValueMap.of(["a", 1]).toString();
  t.equal(str, "ValueMap { a => 1 }");
});

test("#toString() returns empty braces for empty maps", (t) => {
  const str = ValueMap.empty().toString();
  t.equal(str, "ValueMap {}");
});

test(".isValueMap() returns true for ValueMap instances", (t) => {
  t(ValueMap.isValueMap(stringMap));
});

test(".isValueMap() returns false for non-ValueMap values", (t) => {
  t(!ValueMap.isValueMap({}));
  t(!ValueMap.isValueMap([]));
  t(!ValueMap.isValueMap(new Map()));
});

test(".from() creates a ValueMap from an iterable", (t) => {
  const map = ValueMap.from([
    ["a", 1],
    ["b", 2],
  ]);
  t.equal(map.size, 2);
  t.equal(map.get("a").getUnsafe(), 1);
});

test(".from() returns the same instance if already a ValueMap", (t) => {
  const result = ValueMap.from(stringMap);
  t.equal(result, stringMap);
});

test(".fromArray() creates a ValueMap from an array", (t) => {
  const map = ValueMap.fromArray([
    ["a", 1],
    ["b", 2],
  ]);
  t.equal(map.size, 2);
  t.equal(map.get("a").getUnsafe(), 1);
});

test(".fromIterable() creates a ValueMap from an iterable", (t) => {
  const iterable = (function* () {
    yield ["a", 1] as const;
    yield ["b", 2] as const;
  })();
  const map = ValueMap.fromIterable(iterable);
  t.equal(map.size, 2);
  t.equal(map.get("a").getUnsafe(), 1);
});

test("#reduce() reduces values to a single value", (t) => {
  const sum = stringMap.reduce((acc, value) => acc + value, 0);
  t.equal(sum, 10);
});

test("#reduce() passes keys to the reducer", (t) => {
  const keys: string[] = [];
  stringMap.reduce((acc, value, key) => {
    keys.push(key);
    return acc;
  }, 0);
  t.equal(keys.length, 4);
});

test("#forEach() calls a callback for each entry", (t) => {
  let count = 0;
  stringMap.forEach(() => {
    count++;
  });
  t.equal(count, 4);
});

test("#forEach() passes value and key to the callback", (t) => {
  const entries: Array<[string, number]> = [];
  stringMap.forEach((value, key) => {
    entries.push([key, value]);
  });
  t.equal(entries.length, 4);
});

test("ValueMap maintains immutability on mutations", (t) => {
  const original: ValueMap<string, number> = ValueMap.of(["a", 1], ["b", 2]);
  const modified = original.set("c", 3);

  t.equal(original.size, 2);
  t.equal(modified.size, 3);
  t(!original.has("c"));
  t(modified.has("c"));
});

test("ValueMap works with mixed key types in different instances", (t) => {
  const strMap = ValueMap.of(["a", 1]);
  const numMap = ValueMap.of([1, "a"]);
  const boolMap = ValueMap.of([true, "yes"]);

  t.equal(strMap.get("a").getUnsafe(), 1);
  t.equal(numMap.get(1).getUnsafe(), "a");
  t.equal(boolMap.get(true).getUnsafe(), "yes");
});

test("ValueMap handles zero as a number key correctly", (t) => {
  const map = ValueMap.of([0, "zero"], [1, "one"]);
  t(map.has(0));
  t.equal(map.get(0).getUnsafe(), "zero");
});

test("ValueMap handles empty string as a key correctly", (t) => {
  const map = ValueMap.of(["", "empty"], ["a", "not empty"]);
  t(map.has(""));
  t.equal(map.get("").getUnsafe(), "empty");
});

test("ValueMap handles negative numbers as keys correctly", (t) => {
  const map = ValueMap.of([-1, "negative"], [1, "positive"]);
  t(map.has(-1));
  t.equal(map.get(-1).getUnsafe(), "negative");
});
