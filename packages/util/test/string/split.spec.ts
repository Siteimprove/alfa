import { test } from "@alfa/test";
import { split } from "../../src/string/split";

test("Can split a string according to a predicate", async t => {
  t.deepEqual(split("foo bar baz", char => char === " "), [
    "foo",
    "bar",
    "baz"
  ]);
});

test("Ignores trailing matches", async t => {
  t.deepEqual(split(" foo bar baz ", char => char === " "), [
    "foo",
    "bar",
    "baz"
  ]);
});

test("Correctly handles consecutive matches", async t => {
  t.deepEqual(split("foo   bar   baz", char => char === " "), [
    "foo",
    "bar",
    "baz"
  ]);
});
