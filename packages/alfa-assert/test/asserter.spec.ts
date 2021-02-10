import { test } from "@siteimprove/alfa-test";

import { Asserter } from "../src/asserter";

import { Pass, Fail } from "./fixture/rule";

test("#expect() returns an ok when no rules fail", async (t) => {
  const { expect } = Asserter.of([Pass]);

  const result = await expect("foo").to.be.accessible();

  t.equal(result.isOk(), true);
});

test("#expect() returns an error when a rule fails", async (t) => {
  const { expect } = Asserter.of([Pass, Fail]);

  const result = await expect("foo").to.be.accessible();

  t.equal(result.isErr(), true);
});
