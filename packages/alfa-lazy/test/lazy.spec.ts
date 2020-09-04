import { test } from "@siteimprove/alfa-test";

import { Lazy } from "../src/lazy";

const lazy = Lazy.of(() => 42);

test(".of() constructs a lazy value from a thunk", (t) => {
  t.equal(lazy instanceof Lazy, true);
});

test(".of() does not force the thunk value", (t) => {
  Lazy.of(() => {
    throw new Error("The lazy was evaluated");
  });
});

test("#force() evaluates a lazy value", (t) => {
  t.equal(lazy.force(), 42);
});

test("#force() only evaluates a lazy value once, even if called multiple times", (t) => {
  let count = 0;

  const lazy = Lazy.of(() => ++count);

  // First `#force()`, evaluate.
  t.equal(lazy.force(), 1);

  // Second `#force()`, reuse. If not reused, result would have been 2.
  t.equal(lazy.force(), 1);
});

test("#map() applies a function to a lazy value", (t) => {
  t.equal(lazy.map((n) => n / 2).force(), 21);
});

test("#map() does not force the lazy value", (t) => {
  lazy.map(() => {
    throw new Error("The lazy was evaluated");
  });
});

test("#map() does not cause the original lazy value to be evaluated more than once", (t) => {
  let count = 0;

  const lazy = Lazy.of(() => ++count);

  // First `#map()` and `#force()`, evaluate.
  t.equal(lazy.map((n) => n * 2).force(), 2);

  // Second `#map()` and `#force()`, reuse. If not reused, result would have
  // been 4.
  t.equal(lazy.map((n) => n * 2).force(), 2);
});

test("#flatMap() applies a function to a lazy value and flattens the result", (t) => {
  t.equal(lazy.flatMap((n) => Lazy.of(() => n / 2)).force(), 21);
});

test("#flatMap() does not force the lazy value", (t) => {
  // The mapper shouldn't be evaluated immediately...
  lazy.flatMap(() => {
    throw new Error("The lazy was evaluated");
  });

  // ...and neither should the resulting `Lazy`.
  lazy.flatMap(() =>
    Lazy.of(() => {
      throw new Error("The lazy was evaluated");
    })
  );
});

test("#flatMap() does not cause the original lazy value to be evaluated more than once", (t) => {
  let count = 0;

  const lazy = Lazy.of(() => ++count);

  // First `#flatMap()` and `#force()`, evaluate.
  t.equal(lazy.flatMap((n) => Lazy.force(n * 2)).force(), 2);

  // Second `#flatMap()` and `#force(), reuse. If not reused, result would have
  // been 4.
  t.equal(lazy.flatMap((n) => Lazy.force(n * 2)).force(), 2);
});
