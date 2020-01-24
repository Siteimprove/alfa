import { test } from "@siteimprove/alfa-test";

import { Predicate } from "../src/predicate";

function isPositive(x: number) {
  if (x === 0) return undefined;
  if (x > 0) return true;
  if (x < 0) return false;
}

function isPositiveFirst(arr: Array<number>) {
  return isPositive(arr[0]);
}

function isPositiveSecond(arr: Array<number>) {
  return isPositive(arr[1]);
}

test("fold() folds over the truth values of a predicate", t => {
  const f = (value: number) =>
    Predicate.fold(
      isPositive,
      value,
      x => "positive",
      () => "negative",
      () => "who knows?"
    );

  t.equal(f(3), "positive");
  t.equal(f(-2), "negative");
  t.equal(f(0), "who knows?");
});

test("and() combines two predicates to a predicate that is true if both predicates are definitely true", t => {
  const p = Predicate.and(isPositiveFirst, isPositiveSecond);

  t.equal(p([1, 1]), true);
  t.equal(p([1, 0]), undefined);
  t.equal(p([4, -8]), false);

  t.equal(p([-1, 2]), false);
  t.equal(p([-9, 0]), false);
  t.equal(p([-3, -4]), false);

  t.equal(p([0, 19]), undefined);
  t.equal(p([0, 0]), undefined);
  t.equal(p([0, -1]), false);
});

test("or() combines two predicates to a predicate that is true if either predicate is definitely true", t => {
  const p = Predicate.or(isPositiveFirst, isPositiveSecond);

  t.equal(p([1, 1]), true);
  t.equal(p([1, 0]), true);
  t.equal(p([4, -8]), true);

  t.equal(p([-1, 2]), true);
  t.equal(p([-9, 0]), undefined);
  t.equal(p([-3, -4]), false);

  t.equal(p([0, 19]), true);
  t.equal(p([0, 0]), undefined);
  t.equal(p([0, -1]), undefined);
});
