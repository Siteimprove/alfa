import { test } from "@alfa/test";
import { getSpecificity } from "../src/get-specificity";

test("Single class selectors have the same specificity", async t => {
  t.true(getSpecificity(".foo") === getSpecificity(".bar"));
});

test("Two classes are more specific than one", async t => {
  t.true(getSpecificity(".foo .bar") > getSpecificity(".bar"));
});

test("Three classes are more specific than two", async t => {
  t.true(getSpecificity(".foo .bar .baz") > getSpecificity(".foo .bar"));
});

test("Single ID selectors have the same specificity", async t => {
  t.true(getSpecificity("#foo") === getSpecificity("#bar"));
});

test("An ID is more specific than a class", async t => {
  t.true(getSpecificity("#foo") > getSpecificity(".bar"));
});
