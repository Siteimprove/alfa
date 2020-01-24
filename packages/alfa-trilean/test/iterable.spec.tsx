import { Iterable } from "@siteimprove/alfa-iterable";
import { test } from "@siteimprove/alfa-test";
import { every, Predicate, some, Trilean } from "../src";

function isPositive(x: number) {
  if (x === 0) return undefined;
  if (x > 0) return true;
  if (x < 0) return false;
}

const somePositive = some(isPositive);
const everyPositive = every(isPositive);

test("some is false for empty iterable", t => {
  t.equal(somePositive([]), false);
});

test("some is true if one element is true", t => {
  const iterable = Iterable.from([-1, -3, 0, 0, 2, -8]);

  t.equal(somePositive(iterable), true);
});

test("some is undefined if one element is undefined and none are true", t => {
  const iterable = Iterable.from([-1, -3, 0, 0, -2, -8]);

  t.equal(somePositive(iterable), undefined);
});

test("some is false if all elements are false", t => {
  const iterable = Iterable.from([-1, -3, -8]);

  t.equal(somePositive(iterable), false);
});

test("every is true for empty iterable", t => {
  t.equal(everyPositive([]), true);
});

test("every is false if one element is false", t => {
  const iterable = Iterable.from([-1, -3, 0, 0, 2, -8]);

  t.equal(everyPositive(iterable), false);
});

test("every is undefined if one element is undefined and none are false", t => {
  const iterable = Iterable.from([1, 3, 0, 0, 2, 8]);

  t.equal(everyPositive(iterable), undefined);
});

test("every is true if all elements are true", t => {
  const iterable = Iterable.from([1, 3, 8]);

  t.equal(everyPositive(iterable), true);
});
