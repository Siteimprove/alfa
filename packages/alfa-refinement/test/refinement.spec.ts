import { test } from "@siteimprove/alfa-test";

import { Refinement } from "../src/refinement";

test(".test() evaluates a refinement on a value", (t) => {
  const r: Refinement<string, "foo"> = (value): value is "foo" =>
    value === "foo";

  const value: string = "foo";

  if (Refinement.test(r, value)) {
    t.equal<"foo">(value, "foo");
  } else {
    t.fail();
  }

  if (Refinement.test(r, "bar")) {
    t.fail();
  }
});

test(".fold() folds over the truth values of a refinement", (t) => {
  t.equal(
    Refinement.fold(
      (value): value is "foo" => value === "foo",
      (value) => {
        t.equal<"foo">(value, "foo");
        return value;
      },
      () => t.fail(),
      "foo"
    ),
    "foo"
  );

  t.equal(
    Refinement.fold(
      (value): value is "foo" => value === "foo",
      () => t.fail(),
      (value) => value,
      "bar"
    ),
    "foo"
  );
});

test(`.and() combines two refinements to a refinement that is true if both
      refinements are true`, (t) => {
  const p = Refinement.and<unknown, string, "foo">(
    (value): value is string => typeof value === "string",
    (value): value is "foo" => value === "foo"
  );

  t.equal(p("foo"), true);
  t.equal(p("bar"), false);
  t.equal(p(123), false);
  t.equal(p(true), false);
});

test(`.or() combines two refinements to a refinement that is true if either
      refinement is true`, (t) => {
  const p = Refinement.or<string, "foo", "bar">(
    (value): value is "foo" => value === "foo",
    (value): value is "bar" => value === "bar"
  );

  t.equal(p("foo"), true);
  t.equal(p("fo"), false);
  t.equal(p("bar"), true);
  t.equal(p("ba"), false);
});
