import { test } from "@siteimprove/alfa-test";

import { Thenable } from "../src/thenable";

test("await a resolving thenable", async (t) => {
  const foo: Thenable<number> = {
    then(resolve) {
      resolve(42);
    },
  };

  t.equal(await foo, 42);
});

test("await a rejecting thenable", async (t) => {
  const foo: Thenable<number, string> = {
    then(resolve, reject) {
      reject("nope");
    },
  };

  try {
    await foo;
    t.fail();
  } catch (err) {
    t.equal(err, "nope");
  }
});
