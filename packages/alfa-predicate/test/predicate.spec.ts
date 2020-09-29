import { test } from "@siteimprove/alfa-test";

import { Predicate } from "../src/predicate";

test(".test() evaluates a predicate on a value", (t) => {
  const p: Predicate<string> = (value) => value === "foo";

  t.equal(Predicate.test(p, "foo"), true);
  t.equal(Predicate.test(p, "bar"), false);
});

test(".fold() folds over the truth values of a predicate", (t) => {
  t.equal(
    Predicate.fold(
      (value) => value === "foo",
      (value) => value,
      () => t.fail(),
      "foo"
    ),
    "foo"
  );

  t.equal(
    Predicate.fold(
      (value) => value === "foo",
      () => t.fail(),
      (value) => value,
      "bar"
    ),
    "foo"
  );
});

test(`.and() combines two predicates to a predicate that is true if both
      predicates are true`, (t) => {
  const p = Predicate.and<string>(
    (value) => value.startsWith("f"),
    (value) => value.length === 3
  );

  t.equal(p("foo"), true);
  t.equal(p("fo"), false);
  t.equal(p("bar"), false);
  t.equal(p("ba"), false);
});

test(`.or() combines two predicates to a predicate that is true if either
      predicate is true`, (t) => {
  const p = Predicate.or<string>(
    (value) => value.startsWith("f"),
    (value) => value.length === 3
  );

  t.equal(p("foo"), true);
  t.equal(p("fo"), true);
  t.equal(p("bar"), true);
  t.equal(p("ba"), false);
});
