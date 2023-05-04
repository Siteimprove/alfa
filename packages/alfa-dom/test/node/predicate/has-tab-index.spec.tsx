import { test } from "@siteimprove/alfa-test";
import { hasTabIndex } from "../../../src/node/element/predicate/has-tab-index";

const button = <button>lorem</button>;
const span = <span tabindex="1">ipsum</span>;
const link = (
  <a href="#" tabindex="-1">
    dolor
  </a>
);
const heading = <h1>sit</h1>;

test("hasTabIndex() accepts single number", (t) => {
  t.deepEqual(hasTabIndex(0)(button), true);
  t.deepEqual(hasTabIndex(1)(button), false);
  t.deepEqual(hasTabIndex(-1)(button), false);
  t.deepEqual(hasTabIndex(0)(span), false);
  t.deepEqual(hasTabIndex(1)(span), true);
  t.deepEqual(hasTabIndex(-1)(span), false);
  t.deepEqual(hasTabIndex(0)(link), false);
  t.deepEqual(hasTabIndex(1)(link), false);
  t.deepEqual(hasTabIndex(-1)(link), true);
  t.deepEqual(hasTabIndex(0)(heading), false);
  t.deepEqual(hasTabIndex(1)(heading), false);
  t.deepEqual(hasTabIndex(-1)(heading), false);
});

test("hasTabIndex() accepts several numbers", (t) => {
  t.deepEqual(hasTabIndex(0, 1, -1)(button), true);
  t.deepEqual(hasTabIndex(1, -1)(button), false);
  t.deepEqual(hasTabIndex(-1, 0)(button), true);

  t.deepEqual(hasTabIndex(0, 1, -1)(heading), false);
});

test("hasTabIndex() accepts predicate", (t) => {
  const isPositive = (n: number) => n >= 0;
  const isNonPositive = (n: number) => n < 0;
  const isEven = (n: number) => n % 2 === 0;

  t.deepEqual(hasTabIndex(isPositive)(button), true);
  t.deepEqual(hasTabIndex(isNonPositive)(button), false);
  t.deepEqual(hasTabIndex(isEven)(button), true);
  t.deepEqual(hasTabIndex(isPositive)(span), true);
  t.deepEqual(hasTabIndex(isNonPositive)(span), false);
  t.deepEqual(hasTabIndex(isEven)(span), false);
  t.deepEqual(hasTabIndex(isPositive)(link), false);
  t.deepEqual(hasTabIndex(isNonPositive)(link), true);
  t.deepEqual(hasTabIndex(isEven)(link), false);
  t.deepEqual(hasTabIndex(isPositive)(heading), false);
  t.deepEqual(hasTabIndex(isNonPositive)(heading), false);
  t.deepEqual(hasTabIndex(isEven)(heading), false);
});

test("hasTabIndex() accepts zero argument", (t) => {
  t.deepEqual(hasTabIndex()(button), true);
  t.deepEqual(hasTabIndex()(span), true);
  t.deepEqual(hasTabIndex()(link), true);
  t.deepEqual(hasTabIndex()(heading), false);
});
