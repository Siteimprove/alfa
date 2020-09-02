import { test } from "@siteimprove/alfa-test";

import { Branched } from "../src/branched";

const n = Branched.of(1, "foo").branch(2, "bar");

test("#map() applies a function to a branched value", (t) => {
  const m = n.map((value) => value * 2);

  t.deepEqual(m.toArray(), [
    [2, ["foo"]],
    [4, ["bar"]],
  ]);
});

test("#map() merges mapped values", (t) => {
  const m = n.map(() => 3);

  t.deepEqual(m.toArray(), [[3, ["foo", "bar"]]]);
});

test("#flatMap() applies a function to a branched value and flattens the result", (t) => {
  const m = n.flatMap((value) => {
    return Branched.of(value * 2, "foo").branch(value ** 4, "bar");
  });

  t.deepEqual(m.toArray(), [
    [2, ["foo"]],
    [16, ["bar"]],
  ]);
});

test("#flatMap() flattens a branched value of both branchless and branched values", (t) => {
  const n = Branched.of<number, string>(1).branch(8, "foo");

  const m = n.flatMap((n) =>
    Branched.of<number, string>(n + 2).branch(n + 4, "foo")
  );

  t.deepEqual(m.toArray(), [
    [3, []],
    [12, ["foo"]],
  ]);
});

test("#flatMap() keeps branched values when merged with branchless values", (t) => {
  const n = Branched.of<number, string>(1).branch(8, "foo", "bar");

  const m = n.flatMap((n) =>
    Branched.of<number, string>(n + 2).branch(n + 4, "foo")
  );

  t.deepEqual(m.toArray(), [
    [3, []],
    [10, ["bar"]],
    [12, ["foo"]],
  ]);
});

test("#flatMap() assigns unused branches to branchless values", (t) => {
  const n = Branched.of<number, string>(1).branch(8, "foo");

  const m = n.flatMap((n) =>
    Branched.of<number, string>(n + 2, "bar").branch(n + 4, "foo")
  );

  t.deepEqual(m.toArray(), [
    [3, ["bar"]],
    [12, ["foo"]],
  ]);
});

test("#branch() creates an additional value with branches", (t) => {
  t.deepEqual(n.toArray(), [
    [1, ["foo"]],
    [2, ["bar"]],
  ]);
});

test("#branch() merges branches with the same value", (t) => {
  const n = Branched.of(1, "foo").branch(1, "bar");

  t.deepEqual(n.toArray(), [[1, ["foo", "bar"]]]);
});

test("#branch() merges branchless values that are the same", (t) => {
  const n = Branched.of(1).branch(1);

  t.deepEqual(n.toArray(), [[1, []]]);
});

test("#branch() merges branchless values that are not the same", (t) => {
  const n = Branched.of(1).branch(2);

  t.deepEqual(n.toArray(), [[2, []]]);
});

test("#branch() merges branchless and branched values that are the same", (t) => {
  const n = Branched.of<number, string>(1).branch(1, "foo").branch(1, "bar");

  t.deepEqual(n.toArray(), [[1, []]]);
});

test("#branch() removes duplicated branches", (t) => {
  const n = Branched.of(1, "foo", "bar").branch(2, "bar");

  t.deepEqual(n.toArray(), [
    [1, ["foo"]],
    [2, ["bar"]],
  ]);
});

test("#equals() returns true if two branched values are equal", (t) => {
  const n = Branched.of<number, string>(1).branch(2, "foo");
  const m = Branched.of<number, string>(1).branch(2, "foo");

  t.equal(n.equals(m), true);
});

test("#equals() returns false if two branched values are not equal", (t) => {
  const n = Branched.of<number, string>(1).branch(2, "foo");
  const m = Branched.of<number, string>(1).branch(3, "bar");

  t.equal(n.equals(m), false);
});

test(".traverse() traverses a list of values and lifts them to a branched value of lists", (t) => {
  const ns = [1, 2, 3];

  t.deepEqual(
    Branched.traverse(ns, (n) => Branched.of(n, "foo").branch(n * 2, "bar"))
      .map((values) => [...values])
      .toArray(),
    [
      [[1, 2, 3], ["foo"]],
      [[2, 4, 6], ["bar"]],
    ]
  );
});

test(".sequence() inverts a list of branched values to a branched value of lists", (t) => {
  const ns = [
    Branched.of(1, "foo").branch(2, "bar"),
    Branched.of(3, "foo").branch(4, "bar"),
    Branched.of(5, "foo", "bar"),
  ];

  t.deepEqual(
    Branched.sequence(ns)
      .map((values) => [...values])
      .toArray(),
    [
      [[1, 3, 5], ["foo"]],
      [[2, 4, 5], ["bar"]],
    ]
  );
});

test(".sequence() inverts a list of branchless values to a branchless value of lists", (t) => {
  const ns = [Branched.of(1), Branched.of(2), Branched.of(3)];

  t.deepEqual(
    Branched.sequence(ns)
      .map((values) => [...values])
      .toArray(),
    [[[1, 2, 3], []]]
  );
});
