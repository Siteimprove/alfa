import { test } from "@siteimprove/alfa-test";

import { Future } from "../src/future";

function wait(delay: number): Future<void> {
  return Future.defer(callback => setTimeout(callback, delay));
}

test("map() applies a function to the value of a future", async t => {
  const n = wait(10).map(() => 2);

  t.equal(await n.map(n => n * 3), 6);
});

test("map() does not overflow for long chains", async t => {
  let n = wait(10).map(() => 0);

  for (let i = 0; i < 10000; i++) {
    n = n.map(i => i + 1);
  }

  t.equal(await n, 10000);
});

test("flatMap() applies a function to the value of a future and flattens the result", async t => {
  const n = wait(10).flatMap(() => wait(0).map(() => 2));

  t.equal(await n, 2);
});

test("flatMap() does not overflow for long chains", async t => {
  let n = wait(10).map(() => 0);

  for (let i = 0; i < 10000; i++) {
    n = n.flatMap(i => wait(0).map(() => i + 1));
  }

  t.equal(await n, 10000);
});

test("traverse() traverses a list of values and lifts them to a future of lists", async t => {
  const futures = [1, 2, 3, 4];

  t.deepEqual(
    [...(await Future.traverse(futures, n => wait(n * 10).map(() => n)))],
    [1, 2, 3, 4]
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
