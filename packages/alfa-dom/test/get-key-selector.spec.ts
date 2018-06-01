import { test } from "@siteimprove/alfa-test";
import { parse, lex } from "@siteimprove/alfa-lang";
import { Selector, Alphabet, SelectorGrammar } from "@siteimprove/alfa-css";
import { getKeySelector } from "../src/get-key-selector";

const { isArray } = Array;

function selector(input: string): Selector {
  const parsed = parse(lex(input, Alphabet), SelectorGrammar);

  if (parsed === null || isArray(parsed)) {
    throw new Error(`Invalid selector: ${input}`);
  }

  return parsed;
}

test("Gets the key selector of an ID selector", t => {
  t.deepEqual(getKeySelector(selector("#foo")), {
    type: "id-selector",
    name: "foo"
  });
});

test("Gets the key selector of a class selector", t => {
  t.deepEqual(getKeySelector(selector(".foo")), {
    type: "class-selector",
    name: "foo"
  });
});

test("Gets the key selector of a type selector", t => {
  t.deepEqual(getKeySelector(selector("foo")), {
    type: "type-selector",
    name: "foo",
    namespace: null
  });
});

test("Returns null when given the universal selector", t => {
  t.is(getKeySelector(selector("*")), null);
});

test("Gets the key selector of an attribute selector", t => {
  t.deepEqual(getKeySelector(selector("[foo]")), {
    type: "attribute-selector",
    name: "foo",
    value: null,
    matcher: null,
    modifier: null
  });
});

test("Gets the key selector of a pseudo-element selector", t => {
  t.deepEqual(getKeySelector(selector("::before")), {
    type: "pseudo-element-selector",
    name: "before"
  });
});

test("Gets the key selector of a pseudo-class selector", t => {
  t.deepEqual(getKeySelector(selector(":hover")), {
    type: "pseudo-class-selector",
    name: "hover",
    value: null
  });
});

test("Gets the key selector of a compound selector", t => {
  t.deepEqual(getKeySelector(selector("div.foo")), {
    type: "type-selector",
    name: "div",
    namespace: null
  });
});

test("Ignores the universal selector in a compound selector", t => {
  t.deepEqual(getKeySelector(selector("*.foo")), {
    type: "class-selector",
    name: "foo"
  });
});

test("Gets the key selector of a single descendant selector", t => {
  t.deepEqual(getKeySelector(selector("#foo .foo")), {
    type: "class-selector",
    name: "foo"
  });
});

test("Gets the key selector of a double descendant selector", t => {
  t.deepEqual(getKeySelector(selector("div #foo .foo")), {
    type: "class-selector",
    name: "foo"
  });
});

test("Gets the key selector of a sibling selector", t => {
  t.deepEqual(getKeySelector(selector("#foo ~ .foo")), {
    type: "class-selector",
    name: "foo"
  });
});
