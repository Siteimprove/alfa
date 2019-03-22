import { parseSelector, Selector } from "@siteimprove/alfa-css";
import { test } from "@siteimprove/alfa-test";
import { getSpecificity } from "../src/get-specificity";

const { isArray } = Array;

function selector(input: string): Selector {
  const parsed = parseSelector(input);

  if (parsed === null || isArray(parsed)) {
    throw new Error(`Invalid selector: ${input}`);
  }

  return parsed;
}

test("Single class selectors have the same specificity", t => {
  t(getSpecificity(selector(".foo")) === getSpecificity(selector(".bar")));
});

test("Two classes are more specific than one", t => {
  t(getSpecificity(selector(".foo .bar")) > getSpecificity(selector(".bar")));
});

test("Three classes are more specific than two", t => {
  t(
    getSpecificity(selector(".foo .bar .baz")) >
      getSpecificity(selector(".foo .bar"))
  );
});

test("Single ID selectors have the same specificity", t => {
  t(getSpecificity(selector("#foo")) === getSpecificity(selector("#bar")));
});

test("An ID is more specific than a class", t => {
  t(getSpecificity(selector("#foo")) > getSpecificity(selector(".bar")));
});

test("A class is as specific as a pseudo-class-selector", t => {
  t(getSpecificity(selector(".foo")) === getSpecificity(selector(":visited")));
});

test("A class is more specific than a type-selector", t => {
  t(getSpecificity(selector(".foo")) > getSpecificity(selector("a")));
});

test("A class is more specific than a pseudo-element-selector", t => {
  t(
    getSpecificity(selector(".foo")) >
      getSpecificity(selector("::first-letter"))
  );
});

test("A compound selector with two classes is more specific than one class", t => {
  t(
    getSpecificity(selector(".foo.bar")) >
      getSpecificity(selector(".foo-class"))
  );
});
