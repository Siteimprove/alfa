import { test } from "@siteimprove/alfa-test";

import { Thunk } from "../dist/thunk.js";

test(".map() applies a function to a thunk value", (t) => {
  const thunk: Thunk<number> = () => 1;

  t.equal(Thunk.map(thunk, (n) => n * 2)(), 2);
});

test(".map() does not evalaute the thunk value", (t) => {
  const thunk: Thunk<number> = () => {
    throw new Error("Should not be called");
  };

  Thunk.map(thunk, (n) => n * 2);
});

test(".flatMap() applies a function to a thunk value and flattens the result", (t) => {
  const thunk: Thunk<number> = () => 1;

  t.equal(Thunk.flatMap(thunk, (n) => () => n * 2)(), 2);
});

test(".flatMap() does not evalaute the thunk value", (t) => {
  const thunk: Thunk<number> = () => {
    throw new Error("Should not be called");
  };

  Thunk.flatMap(thunk, () => thunk);
});

test(".freeze() freezes a thunk value", (t) => {
  let called = 0;

  const thunk: Thunk<number> = () => ++called;
  const frozen = Thunk.freeze(thunk);

  // The thunk hasn't been evaluated by being frozen.
  t.equal(called, 0);

  // We evaluate the thunk once, and the frozen result is kept.
  t.equal(frozen(), 1);
  t.equal(frozen(), 1);

  // The original thunk is still mutable, and can be evaluated independently.
  t.equal(thunk(), 2);
  t.equal(thunk(), 3);

  // The frozen thunk is unaffected by the original one being evaluated.
  t.equal(frozen(), 1);
});

test(".freeze() only take effect after evaluating the frozen thunk once", (t) => {
  let called = 0;

  const thunk: Thunk<number> = () => ++called;
  const frozen = Thunk.freeze(thunk);

  // The original thunk is still mutable, and can be evaluated independently.
  t.equal(thunk(), 1);
  t.equal(thunk(), 2);

  // The frozen thunk is only frozen when called
  t.equal(frozen(), 3);
  t.equal(frozen(), 3);
});
