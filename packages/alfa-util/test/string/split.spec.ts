import { test } from "@siteimprove/alfa-test";
import { split } from "../../src/string/split";

test("Can split a string according to a predicate", t => {
  t.deepEqual(split("foo bar baz", char => char === " "), [
    "foo",
    "bar",
    "baz"
  ]);
});

test("Ignores trailing matches", t => {
  t.deepEqual(split(" foo bar baz ", char => char === " "), [
    "foo",
    "bar",
    "baz"
  ]);
});

test("Correctly handles consecutive matches", t => {
  t.deepEqual(split("foo   bar   baz", char => char === " "), [
    "foo",
    "bar",
    "baz"
  ]);
});
