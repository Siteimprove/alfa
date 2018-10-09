import { test } from "@siteimprove/alfa-test";
import { none, Option, option, some } from "../src/option";

const something: Option<number> = 4;
const nothing: Option<number> = null;

test("Some only runs callback if parameter is something", t => {
  t.equal(some(4, num => num), something);
  t.equal(some(null, num => num), nothing);
});

test("None only runs callback if parameter is not something", t => {
  t.equal(none(4, () => null), something);
  t.equal(none(null, () => null), nothing);
});

test("Options runs some if parameter is something, else none", t => {
  t.equal(option(4, num => num, () => null), something);
  t.equal(option(null, num => num, () => null), nothing);
});
