import { parseSelector, Selector, SelectorType } from "@siteimprove/alfa-css";
import { test } from "@siteimprove/alfa-test";
import { getKeySelector } from "../src/get-key-selector";

const { isArray } = Array;

function selector(input: string): Selector {
  const parsed = parseSelector(input);

  if (parsed === null || isArray(parsed)) {
    throw new Error(`Invalid selector: ${input}`);
  }

  return parsed;
}

test("Gets the key selector of an ID selector", t => {
  t.deepEqual(getKeySelector(selector("#foo")), {
    type: SelectorType.IdSelector,
    name: "foo"
  });
});

test("Gets the key selector of a class selector", t => {
  t.deepEqual(getKeySelector(selector(".foo")), {
    type: SelectorType.ClassSelector,
    name: "foo"
  });
});

test("Gets the key selector of a type selector", t => {
  t.deepEqual(getKeySelector(selector("foo")), {
    type: SelectorType.TypeSelector,
    name: "foo",
    namespace: null
  });
});

test("Returns null when given the universal selector", t => {
  t.equal(getKeySelector(selector("*")), null);
});

test("Returns null when given an attribute selector", t => {
  t.equal(getKeySelector(selector("[foo]")), null);
});

test("Returns null when given a pseudo-element selector", t => {
  t.equal(getKeySelector(selector("::before")), null);
});

test("Returns null when given a pseudo-class selector", t => {
  t.equal(getKeySelector(selector(":hover")), null);
});

test("Gets the key selector of a compound selector", t => {
  t.deepEqual(getKeySelector(selector("div.foo")), {
    type: SelectorType.TypeSelector,
    name: "div",
    namespace: null
  });
});

test("Ignores the universal selector in a compound selector", t => {
  t.deepEqual(getKeySelector(selector("*.foo")), {
    type: SelectorType.ClassSelector,
    name: "foo"
  });
});

test("Gets the key selector of a single descendant selector", t => {
  t.deepEqual(getKeySelector(selector("#foo .foo")), {
    type: SelectorType.ClassSelector,
    name: "foo"
  });
});

test("Gets the key selector of a double descendant selector", t => {
  t.deepEqual(getKeySelector(selector("div #foo .foo")), {
    type: SelectorType.ClassSelector,
    name: "foo"
  });
});

test("Gets the key selector of a sibling selector", t => {
  t.deepEqual(getKeySelector(selector("#foo ~ .foo")), {
    type: SelectorType.ClassSelector,
    name: "foo"
  });
});
