import { test } from "@siteimprove/alfa-test";

import { Future } from "../src/future";

function wait(delay: number): Future<void> {
  return Future.defer(callback => setTimeout(callback, delay));
}

test("map() applies a function to the value of a future", async t => {
  const n = wait(10).map(() => 2);

  t.equal(await n.map(n => n * 3), 6);
});

test("map() does not overflow for long now() chains", async t => {
  let n = Future.now(0);

  for (let i = 0; i < 100000; i++) {
    n = n.map(i => i + 1);
  }

  t.equal(await n, 100000);
});

test("map() does not overflow for long delay() chains", async t => {
  let n = Future.delay(() => 0);

  for (let i = 0; i < 100000; i++) {
    n = n.map(i => i + 1);
  }

  t.equal(await n, 100000);
});

test("map() does not overflow for long defer() chains", async t => {
  let n = Future.defer<number>(done => done(0));

  for (let i = 0; i < 100000; i++) {
    n = n.map(i => i + 1);
  }

  t.equal(await n, 100000);
});

test("map() does not run a deferred future", t => {
  Future.defer(callback => callback(42)).map(n => {
    throw new Error("The future was run");
  });
});

test("flatMap() applies a function to the value of a future and flattens the result", async t => {
  const n = wait(10).flatMap(() => wait(0).map(() => 2));

  t.equal(await n, 2);
});

test("flatMap() does not overflow for long now() chains", async t => {
  let n = Future.now(0);

  for (let i = 0; i < 100000; i++) {
    n = n.flatMap(i => Future.now(i + 1));
  }

  t.equal(await n, 100000);
});

test("flatMap() does not overflow for long nested now() chains", async t => {
  function count(n: number, i = 0): Future<number> {
    const t = Future.now(i);
    return t.flatMap(i => (i === n ? t : count(n, i + 1)));
  }

  t.equal(await count(100000), 100000);
});

test("flatMap() does not overflow for long delay() chains", async t => {
  let n = Future.delay(() => 0);

  for (let i = 0; i < 100000; i++) {
    n = n.flatMap(i => Future.delay(() => i + 1));
  }

  t.equal(await n, 100000);
});

test("flatMap() does not overflow for long nested delay() chains", async t => {
  function count(n: number, i = 0): Future<number> {
    const t = Future.delay(() => i);
    return t.flatMap(i => (i === n ? t : count(n, i + 1)));
  }

  t.equal(await count(100000), 100000);
});

test("flatMap() does not overflow for long defer() chains", async t => {
  let n = Future.defer<number>(done => done(0));

  for (let i = 0; i < 100000; i++) {
    n = n.flatMap(i => Future.defer(done => done(i + 1)));
  }

  t.equal(await n, 100000);
});

test("flatMap() does not overflow for long nested defer() chains", async t => {
  function count(n: number, i = 0): Future<number> {
    const t = Future.defer<number>(done => done(i));
    return t.flatMap(i => (i === n ? t : count(n, i + 1)));
  }

  const n = count(100000);

  t.equal(await n, 100000);
});

test("traverse() traverses a list of values and lifts them to a future of lists", async t => {
  t.deepEqual(
    await Future.traverse([1, 2, 3, 4], n =>
      wait(n * 10).map(() => n * 2)
    ).map(ns => [...ns]),
    [2, 4, 6, 8]
  );
});

test("traverse() does not run any resulting deferred futures", t => {
  Future.traverse([1, 2, 3, 4], n =>
    Future.delay(() => {
      throw new Error("The future was run");
    })
  );
});

test("sequence() inverts a list of futures to a future of lists", async t => {
  const futures = [
    wait(40).map(() => 1),
    wait(20).map(() => 2),
    wait(30).map(() => 3),
    wait(10).map(() => 4)
  ];

  t.deepEqual([...(await Future.sequence(futures))], [1, 2, 3, 4]);
});

test("from() converts a promise to a future", async t => {
  const future = Future.from(
    new Promise<number>(resolve => resolve(2))
  );

  t.equal(await future, 2);
});
