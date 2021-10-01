import { test } from "@siteimprove/alfa-test";

import { Thenable } from "../src/thenable";

test("await a resolving thenable", async (t) => {
  t.equal(await Thenable.resolve(42), 42);
});

test("await a rejecting thenable", async (t) => {
  try {
    await Thenable.reject("nope");
    t.fail();
  } catch (err) {
    t.equal(err, "nope");
  }
});

test(".map() applies a function to the value of a thenable", async (t) => {
  t.equal(
    await Thenable.map(Thenable.resolve(42), (x) => x.toString(10)),
    "42"
  );
});

test(".flatMap() applies a function to the value of a thenable and flattens the result", async (t) => {
  t.equal(
    await Thenable.flatMap(Thenable.resolve(42), (x) =>
      Thenable.resolve(x.toString(10))
    ),
    "42"
  );
});
