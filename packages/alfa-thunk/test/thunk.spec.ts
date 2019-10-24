import { test } from "@siteimprove/alfa-test";

import { Thunk } from "../src/thunk";

test("map() applies a function to a thunk value", t => {
  const thunk: Thunk<number> = () => 1;

  t.equal(Thunk.map(thunk, n => n * 2)(), 2);
});

test("map() does not evalaute the thunk value", t => {
  const thunk: Thunk<number> = () => {
    throw new Error("Should not be called");
  };

  Thunk.map(thunk, n => n * 2);
});
