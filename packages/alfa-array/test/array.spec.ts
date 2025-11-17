import { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import { FNV } from "@siteimprove/alfa-fnv";
import { None, Option } from "@siteimprove/alfa-option";
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

  test(".allocate() creates a sparse array", (t) => {
    const arr = Array.allocate(3);

    t.equal(arr.length, 3);
    t.equal(arr[0], undefined);
    t.equal(arr[1], undefined);
    t.equal(arr[2], undefined);
    t.deepEqual(arr, [undefined, undefined, undefined]);

    let items = 0;
    arr.forEach(() => items++);
    t.equal(items, 0);
  });

  test(".from() creates an array from an iterable", (t) => {
    const iterable = {
      [Symbol.iterator]: function* () {
        yield 1;
        yield 2;
        yield 3;
      },
    };
    t.deepEqual(Array.from(iterable), [1, 2, 3]);
  });

  test(".from() does not copy arrays", (t) => {
    const arr = [1, 2, 3];
    t(Array.from(arr) === arr);
  });

  test(".isArray() recognize arrays", (t) => {
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

describe("Copy/clone", () => {
  test(".copy() creates a new copy of an array", (t) => {
    const arr = [1, 2];
    const copied = Array.copy(arr);
    t.notEqual(copied, arr);
    t.deepEqual(copied, arr);
  });

  test(".clone() creates a clone of an array of clonables", (t) => {
    class Clonable {
      public _x: number;

      constructor(x: number) {
        this._x = x;
      }

      public clone(): Clonable {
        return new Clonable(this._x);
      }
    }

    const arr = [new Clonable(1), new Clonable(2)];
    const cloned = Array.clone(arr);

    t.notEqual(cloned, arr);
    t.deepEqual(cloned, arr);
  });
});

describe("Iterators and flat iterators", () => {
  test(".forEach() iterate on each element of an array", (t) => {
    const values: number[] = [];
    Array.forEach([10, 20, 30], (v, i) => values.push(v + i));
    t.deepEqual(values, [10, 21, 32]);
  });

  test(".map() applies its argument to each element of an array", (t) => {
    const mapped = Array.map([1, 2, 3], (x, i) => x * i);
    t.deepEqual(mapped, [0, 2, 6]);
  });

  test(".flatMap() flattens its results", (t) => {
    const flat = Array.flatMap([1, 2, 3], (x, i) => [x, x + i]);
    t.deepEqual(flat, [1, 1, 2, 3, 3, 5]);
  });

  test(".flatten() flattens an array of arrays", (t) => {
    const flattened = Array.flatten([[1, 2], [3], [], [4]]);
    t.deepEqual(flattened, [1, 2, 3, 4]);
  });
});

describe("Reducers", () => {
  test(".reduce() applies a reducer and accumulate results", (t) => {
    const sum = Array.reduce([1, 2, 3], (acc, v) => acc + v, 0);
    t.equal(sum, 6);
  });

  test(".reduceWhile() only reduces as long as the predicate is true", (t) => {
    const prodWhile = Array.reduceWhile(
      [2, 3, 4, 0, 5],
      (v) => v !== 0,
      (acc, v) => acc * v,
      1,
    );
    t.equal(prodWhile, 24);
  });

  test(".reduceUntil() reduces until the predicate is true", (t) => {
    const prodUntil = Array.reduceUntil(
      [2, 0, 3],
      (v) => v === 0,
      (acc, v) => acc * v,
      1,
    );
    t.equal(prodUntil, 2);
  });
});

test(".apply() applies all mappers to each element", (t) => {
  const arr = [1, 2];
  const res = Array.apply(arr, [(x) => x + 1, (x) => x * 2]);
  t.deepEqual(res, [2, 3, 2, 4]);
});

describe("Filters and searches", () => {
  const arr = [0, 1, 2, 3, 2];
  test(".filter() only keeps elements matching a predicate", (t) => {
    t.deepEqual(
      Array.filter(arr, (x) => x % 2 === 0),
      [0, 2, 2],
    );
  });

  test(".reject() only keeps elements not matching a predicate", (t) => {
    t.deepEqual(
      Array.reject(arr, (x) => x % 2 === 0),
      [1, 3],
    );
  });

  test(".find(), returns the index of the first element matching a predicate, if any", (t) => {
    t.equal(Array.find(arr, (x) => x > 2).getOr(-1), 3);
    t(Array.find(arr, (x) => x > 10).isNone());
  });

  test(".findLast(), returns the index of the last element matching a predicate, if any", (t) => {
    t.equal(Array.findLast(arr, (x) => x === 2).getOr(-1), 2);
    t(Array.findLast(arr, (x) => x > 10).isNone());
  });

  test(".search() returns the index of an element equal to the search value", (t) => {
    t.equal(Array.search([1, 3, 4, 7], 4, Comparable.compare), 2);
    t.equal(Array.search([4, 4, 4, 7], 4, Comparable.compare), 1);
  });

  test(".search() returns the index of the first element greater than the search value, if any", (t) => {
    t.equal(Array.search([1, 3, 5, 7], 4, Comparable.compare), 2);

    t.equal(Array.search([1, 3, 3, 3], 4, Comparable.compare), 4);
  });

  test(".includes(), checks whether an array includes a given element", (t) => {
    t(Array.includes(arr, 3));
    t(!Array.includes(arr, 42));
  });
});

describe("Collectors", () => {
  const arr = [1, 2, 4, 3];

  test(".collect keeps results that are mapped to a non-empty Option", (t) => {
    const collected = Array.collect(arr, (x) =>
      x % 2 === 0 ? Option.of(x * 10) : None,
    );
    t.deepEqual(collected, [20, 40]);

    const none = Array.collect(arr, () => None);
    t.deepEqual(none, []);
  });

  test(".collectFirst returns the first result that is mapped to a non-empty Option", (t) => {
    const first = Array.collectFirst(arr, (x) => (x > 2 ? Option.of(x) : None));
    t.equal(first.getOr(-1), 4);

    const none = Array.collectFirst(arr, () => None);
    t(none.isNone());
  });
});

describe("Quantifiers", () => {
  const arr = [1, 2, 2, 3];
  test(".some() checks if at least one element verifies a predicate", (t) => {
    t(Array.some(arr, (x) => x === 2));
    t(!Array.some(arr, (x) => x === 4));
  });

  test(".some() returns false on an empty array", (t) => {
    t(!Array.some([], (x) => x === 2));
  });

  test(".none() checks if no element verifies a predicate", (t) => {
    t(Array.none(arr, (x) => x === 4));
    t(!Array.none(arr, (x) => x === 2));
  });

  test(".none() returns true on an empty array", (t) => {
    t(Array.none([], (x) => x === 2));
  });

  test(".every() checks if all elements verify a predicate", (t) => {
    t(Array.every(arr, (x) => x >= 1));
    t(!Array.every(arr, (x) => x == 1));
  });

  test(".every() returns true on an empty array", (t) => {
    t(Array.every([], (x) => x === 2));
  });

  test(".count() counts how many elements verify a predicate", (t) => {
    t.equal(
      Array.count(arr, (x) => x === 2),
      2,
    );
    t.equal(
      Array.count(arr, (x) => x === 4),
      0,
    );
  });
});

describe("Indexing", () => {
  // Tests that mutate the array use their own copy to avoid race conditions.
  const arr = [10, 20];

  test(".get() returns the value of an element at an index within bounds", (t) => {
    t.equal(Array.get(arr, 0).getUnsafe(), 10);
    t(Array.get(arr, 5).isNone());
    t(Array.get(arr, -1).isNone());
  });

  test(".first()/.last() returns the first/last element of a non-empty array", (t) => {
    const array = [5, 6];
    t.equal(Array.first(array).getUnsafe(), 5);
    t(Array.first([]).isNone());

    t.equal(Array.last(array).getUnsafe(), 6);
    t(Array.last([]).isNone());
  });

  test(".has() checks for existence of an index", (t) => {
    t(Array.has(arr, 1));
    t(!Array.has(arr, 2));
    t(!Array.has(arr, -2));
  });

  test(".set() changes the value of an index within bounds", (t) => {
    const arr = [10, 20];

    Array.set(arr, 1, 99);
    t.equal(arr[1], 99);

    Array.set(arr, 5, 123);
    t.equal(arr.length, 2);
    Array.set(arr, -5, 123);
    t.equal(arr.length, 2);
  });

  test(".insert() inserts the value at a given index within bounds", (t) => {
    const arr = [10, 20, 99];
    Array.insert(arr, 1, 42);
    t.deepEqual(arr, [10, 42, 20, 99]);

    Array.insert(arr, 10, 7);
    t.deepEqual(arr, [10, 42, 20, 99]);

    Array.insert(arr, 10, -7);
    t.deepEqual(arr, [10, 42, 20, 99]);
  });

  test(".append() adds one element to the end of an array", (t) => {
    const arr = [10, 20];
    Array.append(arr, 8);
    t.deepEqual(arr, [10, 20, 8]);
  });

  test(".prepend() adds one element to the start of an array", (t) => {
    Array.prepend(arr, 1);
    t.deepEqual(arr[0], 1);
  });
});

describe("Set operations", () => {
  const a = [1, 2, 3];
  const b = [3, 4];

  test(".concat() adds an array at the end of another", (t) => {
    t.deepEqual(Array.concat(a, b), [1, 2, 3, 3, 4]);
  });

  test(".subtract() removes elements of an array from a source", (t) => {
    t.deepEqual(Array.subtract(a, b), [1, 2]);
  });

  test(".intersect() returns elements that are in both arrays", (t) => {
    t.deepEqual(Array.intersect(a, b), [3]);
  });

  test(".distinct() only keeps the first occurrence of each element in an array", (t) => {
    const arr = [1, 2, 2, 3, 1];
    t.deepEqual(Array.distinct(arr), [1, 2, 3]);
  });

  test(".zip() zips two arrays, up to the length of the shortest", (t) => {
    t.deepEqual(Array.zip([1, 2], ["a", "b"]), [
      [1, "a"],
      [2, "b"],
    ]);

    t.deepEqual(Array.zip([1, 2], ["a", "b", "c"]), [
      [1, "a"],
      [2, "b"],
    ]);

    t.deepEqual(Array.zip([1, 2, 3], ["a", "b"]), [
      [1, "a"],
      [2, "b"],
    ]);
  });
});

describe("Sorting and comparing", () => {
  const arr = [3, 1, 2];

  class ComparableInt {
    public _value: number;

    constructor(value: number) {
      this._value = value;
    }

    public compare(that: ComparableInt): Comparison {
      // WARNING! does the comparison in reverse!
      return Comparable.compare(that._value, this._value);
    }
  }

  const big = new ComparableInt(1);
  const medium = new ComparableInt(2);
  const small = new ComparableInt(3);

  test(".sortWith() sorts an array according to a comparison function", (t) => {
    Array.sortWith(arr, Comparable.compare);
    t.deepEqual(arr, [1, 2, 3]);
  });

  test(".sort sorts an array", (t) => {
    // Remember ComparableInt.compare does the comparison in reverse!
    t.deepEqual(Array.sort([big, small, medium]), [small, medium, big]);
  });

  test(".compareWith() compares two arrays lexicographically according to a comparison function", (t) => {
    t.equal(
      Array.compareWith<number, number>([1, 2], [1, 2], Comparable.compare),
      Comparison.Equal,
    );

    t.equal(
      Array.compareWith<number, number>([1, 2, 3], [1, 2], Comparable.compare),
      Comparison.Greater,
    );

    t.equal(
      Array.compareWith<number, number>(
        [1, 2, 10],
        [1, 3, 1, 10, 100],
        Comparable.compare,
      ),
      Comparison.Less,
    );
  });

  test(".compare() compares array lexicographically", (t) => {
    // Remember ComparableInt.compare does the comparison in reverse!
    t.equal(Array.compare([big, medium], [big, medium]), Comparison.Equal);

    t.equal(
      Array.compare([big, medium, small], [big, medium]),
      Comparison.Greater,
    );

    t.equal(
      Array.compare([big, medium, small, small], [big, small, big, big, big]),
      Comparison.Greater,
    );
  });
});

test(".equals() checks physical then Equatable equality", (t) => {
  t(Array.equals([1, 2], [1, 2]));
  t(!Array.equals([1, 2], [1, 3]));
  t(!Array.equals([1, 2], [1, 2, 3]));

  const item = (eq: boolean) => ({
    equals(_: unknown): boolean {
      return eq;
    },
  });

  t(!Array.equals([item(false)], [item(false)]));
  t(Array.equals([item(true)], [item(true)]));

  const foo = item(false);
  t(Array.equals([foo], [foo]));
});

test(".iterator() creates an iterator over an array", (t) => {
  const it = Array.iterator([1, 2]);
  let next = it.next();
  t.equal(next.value, 1);
  t(!next.done);

  next = it.next();
  t.equal(next.value, 2);
  t(!next.done);

  next = it.next();
  t.equal(next.value, undefined);
  t(next.done);
});

test(".toJSON() serializes an array", (t) => {
  t.deepEqual(Array.toJSON([1, 2]), [1, 2]);

  t.deepEqual(
    Array.toJSON([{ toJSON: () => 10 }, { toJSON: () => 20 }]),
    [10, 20],
  );
});

test(".hash() hashes an array", (t) => {
  const hash = FNV.empty();
  Array.hash([1, 2, 3], hash);

  t.equal(hash.finish(), 3798348351);
});
