import { test } from "@siteimprove/alfa-test";

import { Promise } from "../src/promise";

test(`.isPromise() tests if a value is a promise`, (t) => {
  t.equal(Promise.isPromise(Promise.resolve(42)), true);
  t.equal(Promise.isPromise(42), false);
});

test(`.all() resolves with the values of all passed promises once resolved`, async (t) => {
  t.deepEqual(await Promise.all(Promise.resolve(1), Promise.resolve(2)), [
    1,
    2,
  ]);
});

test(`.all() rejects as soon as a passed promise rejects`, async (t) => {
  try {
    await Promise.all(Promise.resolve(1), Promise.reject("foo"));
  } catch (err) {
    t.equal(err, "foo");
  }
});

test(`.any() resolves with the value the first promise that resolves`, async (t) => {
  t.deepEqual(
    await Promise.any<number>(Promise.resolve(1), Promise.reject("foo")),
    1
  );
});

test(`.any() rejects as soon as all passed promises reject`, async (t) => {
  try {
    await Promise.any<number>(Promise.reject("foo"), Promise.reject("bar"));
  } catch (err) {
    t.deepEqual(err, ["foo", "bar"]);
  }
});
