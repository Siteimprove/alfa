import { Oracle } from "@siteimprove/alfa-act";
import { Future } from "@siteimprove/alfa-future";
import { Option } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import { Asserter } from "../src/asserter";

import { CantTell, Fail, Pass } from "./fixture/rule";

test("#expect() returns an ok when no rules fail", async (t) => {
  const { expect } = Asserter.of([Pass("pass")]);

  const result = await expect("foo").to.be.accessible();

  t.equal(result.isOk(), true);
});

test("#expect() returns an error when a rule fails", async (t) => {
  const { expect } = Asserter.of([Pass("pass"), Fail("fail")]);

  const result = await expect("foo").to.be.accessible();

  t.equal(result.isErr(), true);
});

test("#expect() allows filtering of failed outcomes", async (t) => {
  const { expect } = Asserter.of([Pass("pass"), Fail("good")], [], {
    filter: (outcome) => outcome.rule.uri !== "good",
  });

  const result = await expect("foo").to.be.accessible();

  t.equal(result.isOk(), true);
});

// test("#expect() accepts an oracle", async (t) => {
//   const oracle: Oracle<string, string, { boolean: boolean }, string> = <A>() =>
//     Future.now(Option.of(true as unknown as A));
//
//   const { expect } = Asserter.of([Pass("pass"), CantTell("maybe")], [], {
//     oracle,
//   });
//
//   const result = await expect("foo").to.be.accessible();
//
//   t.equal(result.isOk(), true);
// });
