import { test } from "@alfa/test";
import { parse, lex } from "@alfa/lang";
import { Selector, Alphabet, SelectorGrammar } from "@alfa/css";
import { getSpecificity } from "../src/get-specificity";

const { isArray } = Array;

function selector(input: string): Selector {
  const parsed = parse(lex(input, Alphabet), SelectorGrammar);

  if (parsed === null || isArray(parsed)) {
    throw new Error(`Invalid selector: ${input}`);
  }

  return parsed;
}

test("Single class selectors have the same specificity", async t => {
  t.true(getSpecificity(selector(".foo")) === getSpecificity(selector(".bar")));
});

test("Two classes are more specific than one", async t => {
  t.true(
    getSpecificity(selector(".foo .bar")) > getSpecificity(selector(".bar"))
  );
});

test("Three classes are more specific than two", async t => {
  t.true(
    getSpecificity(selector(".foo .bar .baz")) >
      getSpecificity(selector(".foo .bar"))
  );
});

test("Single ID selectors have the same specificity", async t => {
  t.true(getSpecificity(selector("#foo")) === getSpecificity(selector("#bar")));
});

test("An ID is more specific than a class", async t => {
  t.true(getSpecificity(selector("#foo")) > getSpecificity(selector(".bar")));
});
