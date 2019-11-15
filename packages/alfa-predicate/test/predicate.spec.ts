import { test } from "@siteimprove/alfa-test";

import { Predicate } from "../src/predicate";

function isString(): Predicate<unknown, string> {
  return x => typeof x === "string";
}

function isFoo(): Predicate<string, "foo"> {
  return x => x === "foo";
}

function isNumber(): Predicate<unknown, number> {
  return x => typeof x === "number";
}

test("fold() folds over the truth values of a predicate", t => {
  const f = (value: unknown) =>
    Predicate.fold(isString(), value, x => `hello ${x}`, () => "goodbye");

  t.equal(f("world"), "hello world");
  t.equal(f(true), "goodbye");
});

test("and() combines two predicates to a predicate that is true if both predicates are true", t => {
  const p = Predicate.and(isString(), isFoo());

  t.equal(p("foo"), true);
  t.equal(p("bar"), false);
  t.equal(p(true), false);
});

test("or() combines two predicates to a predicate that is true if either predicate is true", t => {
  const p = Predicate.or(isString(), isNumber());

  t.equal(p("foo"), true);
  t.equal(p(1), true);
  t.equal(p(true), false);
});

test("test() evaluates a predicate on a value and acts as a type guard", t => {
  const value = "foo";

  if (Predicate.test(isFoo(), value)) {
    const foo: "foo" = value;

    t.equal(foo, "foo");
  } else {
    t.fail();
  }
});
