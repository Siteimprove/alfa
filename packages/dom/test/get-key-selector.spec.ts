import { test } from "@alfa/test";
import { parse, lex } from "@alfa/lang";
import { Selector, Alphabet, SelectorGrammar } from "@alfa/css";
import { getKeySelector } from "../src/get-key-selector";

const { isArray } = Array;

function selector(input: string): Selector {
  const parsed = parse(lex(input, Alphabet), SelectorGrammar);

  if (parsed === null || isArray(parsed)) {
    throw new Error(`Invalid selector: ${input}`);
  }

  return parsed;
}

test("Gets the key selector of an ID selector", async t => {
  t.deepEqual(getKeySelector(selector("#foo")), {
    type: "id-selector",
    name: "foo"
  });
});

test("Gets the key selector of a class selector", async t => {
  t.deepEqual(getKeySelector(selector(".foo")), {
    type: "class-selector",
    name: "foo"
  });
});

test("Gets the key selector of a type selector", async t => {
  t.deepEqual(getKeySelector(selector("foo")), {
    type: "type-selector",
    name: "foo"
  });
});

test("Returns null when given the universal selector", async t => {
  t.is(getKeySelector(selector("*")), null);
});

test("Gets the key selector of an attribute selector", async t => {
  t.deepEqual(getKeySelector(selector("[foo]")), {
    type: "attribute-selector",
    name: "foo",
    value: null,
    matcher: null
  });
});

test("Gets the key selector of a pseudo-element selector", async t => {
  t.deepEqual(getKeySelector(selector("::before")), {
    type: "pseudo-element-selector",
    name: "before"
  });
});

test("Gets the key selector of a pseudo-class selector", async t => {
  t.deepEqual(getKeySelector(selector(":hover")), {
    type: "pseudo-class-selector",
    name: "hover",
    value: null
  });
});

test("Gets the key selector of a compound selector", async t => {
  t.deepEqual(getKeySelector(selector("div.foo")), {
    type: "type-selector",
    name: "div"
  });
});

test("Ignores the universal selector in a compound selector", async t => {
  t.deepEqual(getKeySelector(selector("*.foo")), {
    type: "class-selector",
    name: "foo"
  });
});

test("Gets the key selector of a single descendant selector", async t => {
  t.deepEqual(getKeySelector(selector("#foo .foo")), {
    type: "class-selector",
    name: "foo"
  });
});

test("Gets the key selector of a double descendant selector", async t => {
  t.deepEqual(getKeySelector(selector("div #foo .foo")), {
    type: "class-selector",
    name: "foo"
  });
});

test("Gets the key selector of a sibling selector", async t => {
  t.deepEqual(getKeySelector(selector("#foo ~ .foo")), {
    type: "class-selector",
    name: "foo"
  });
});
