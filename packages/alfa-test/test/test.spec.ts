import { test } from "../src/test";

test("Can test a passing block", async (t) => {
  t.equal(true, true);
});

test("Can test a block throwing errors", async (t) => {
  t.throws(() => {
    throw Error("You shall not pass");
  });
});
