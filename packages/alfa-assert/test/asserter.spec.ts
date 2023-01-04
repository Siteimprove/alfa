import { Future } from "@siteimprove/alfa-future";
import { Hashable } from "@siteimprove/alfa-hash";
import { Option } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import { Asserter } from "../src/asserter";

import { CantTell, Fail, Pass } from "./fixture/rule";

const foo = { value: "foo", hash: () => {} };

test("#expect() returns an ok when no rules fail", async (t) => {
  const { expect } = Asserter.of([Pass("pass")]);

  const result = await expect(foo).to.be.accessible();

  t.equal(result.isOk(), true);
});

test("#expect() returns an error when a rule fails", async (t) => {
  const { expect } = Asserter.of([Pass("pass"), Fail("fail")]);

  const result = await expect(foo).to.be.accessible();

  t.equal(result.isErr(), true);
});

test("#expect() allows filtering of failed outcomes", async (t) => {
  const { expect } = Asserter.of([Pass("pass"), Fail("good")], [], {
    filter: (outcome) => outcome.rule.uri !== "good",
  });

  const result = await expect(foo).to.be.accessible();

  t.equal(result.isOk(), true);
});

test("#expect() allows to reject cantTell outcomes", async (t) => {
  const { expect } = Asserter.of(
    [
      Pass<Hashable, { "is-passed": ["boolean", boolean] }>("pass"),
      CantTell("maybe"),
    ],
    [],
    {
      filterCantTell: () => true,
    }
  );

  const result = await expect(foo).to.be.accessible();

  t.equal(result.isErr(), true);
});

test("#expect() accepts an oracle", async (t) => {
  const { expect } = Asserter.of(
    [
      Pass<Hashable, { "is-passed": ["boolean", boolean] }>("pass"),
      CantTell("maybe"),
    ],
    [],
    {
      oracle: (_, question) => Future.now(Option.of(true)),
    }
  );

  const result = await expect(foo).to.be.accessible();

  t.equal(result.isOk(), true);
});
