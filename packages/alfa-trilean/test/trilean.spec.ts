import { test } from "@siteimprove/alfa-test";

import { Trilean } from "../src";

const isPositive: Trilean.Predicate<number> = (x) => {
  if (x > 0) {
    return true;
  }

  if (x < 0) {
    return false;
  }

  return undefined;
};

function isPositiveAt(i: number): Trilean.Predicate<Array<number>> {
  return (array) => isPositive(array[i]);
}

test(".fold() folds over the truth values of a predicate", (t) => {
  const f = (value: number) =>
    Trilean.fold(
      isPositive,
      () => "positive",
      () => "negative",
      () => "who knows?",
      value
    );

  t.equal(f(3), "positive");
  t.equal(f(-2), "negative");
  t.equal(f(0), "who knows?");
});

test(`.and() combines two predicates to a predicate that is true if both
      predicates are definitely true`, (t) => {
  const p = Trilean.and(isPositiveAt(0), isPositiveAt(1));

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

test(`.or() combines two predicates to a predicate that is true if either
      predicate is definitely true`, (t) => {
  const p = Trilean.or(isPositiveAt(0), isPositiveAt(1));

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

test(".some() is false for empty iterable", (t) => {
  t.equal(Trilean.some([], isPositive), false);
});

test(".some() is true if one element is true", (t) => {
  t.equal(Trilean.some([-1, -3, 0, 0, 2, -8], isPositive), true);
});

test(".some() is undefined if one element is undefined and none are true", (t) => {
  t.equal(Trilean.some([-1, -3, 0, 0, -2, -8], isPositive), undefined);
});

test(".some() is false if all elements are false", (t) => {
  t.equal(Trilean.some([-1, -3, -8], isPositive), false);
});

test(".every() is true for empty iterable", (t) => {
  t.equal(Trilean.every([], isPositive), true);
});

test(".every() is false if one element is false", (t) => {
  t.equal(Trilean.every([-1, -3, 0, 0, 2, -8], isPositive), false);
});

test(".every() is undefined if one element is undefined and none are false", (t) => {
  t.equal(Trilean.every([1, 3, 0, 0, 2, 8], isPositive), undefined);
});

test(".every() is true if all elements are true", (t) => {
  t.equal(Trilean.every([1, 3, 8], isPositive), true);
});
