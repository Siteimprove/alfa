import { test } from "@alfa/test";
import { getKeySelector } from "../src/get-key-selector";

test("Gets the key selector of an ID selector", async t => {
  t.deepEqual(getKeySelector("#foo"), {
    type: "id-selector",
    name: "foo"
  });
});

test("Gets the key selector of a class selector", async t => {
  t.deepEqual(getKeySelector(".foo"), {
    type: "class-selector",
    name: "foo"
  });
});

test("Gets the key selector of an attribute selector", async t => {
  t.deepEqual(getKeySelector("[foo]"), {
    type: "attribute-selector",
    name: "foo",
    value: null,
    matcher: null
  });
});

test("Gets the key selector of a pseudo-element selector", async t => {
  t.deepEqual(getKeySelector("::before"), {
    type: "pseudo-element-selector",
    name: "before"
  });
});

test("Gets the key selector of a pseudo-class selector", async t => {
  t.deepEqual(getKeySelector(":hover"), {
    type: "pseudo-class-selector",
    name: "hover",
    value: null
  });
});

test("Gets the key selector of a single descendant selector", async t => {
  t.deepEqual(getKeySelector("#foo .foo"), {
    type: "class-selector",
    name: "foo"
  });
});

test("Gets the key selector of a double descendant selector", async t => {
  t.deepEqual(getKeySelector("div #foo .foo"), {
    type: "class-selector",
    name: "foo"
  });
});

test("Gets the key selector of a sibling selector", async t => {
  t.deepEqual(getKeySelector("#foo ~ .foo"), {
    type: "class-selector",
    name: "foo"
  });
});
