/// <reference lib="dom" />
import { h } from "@siteimprove/alfa-dom";
import { None } from "@siteimprove/alfa-option";
import { parse } from "@siteimprove/alfa-selector/test/parser";
import { test } from "@siteimprove/alfa-test";

import { RuleTree } from "../src";

function fakeItem(selector: string): RuleTree.Item {
  return {
    rule: h.rule.style(selector, []),
    selector: parse(selector),
    declarations: [],
  };
}

function fakeJSON(selector: string): RuleTree.Item.JSON {
  const item = fakeItem(selector);

  return {
    rule: item.rule.toJSON(),
    selector: item.selector.toJSON(),
    declarations: [],
  };
}

/**
 * Node tests
 */
test(".of() builds a node", (t) => {
  const node = RuleTree.Node.of(fakeItem("div"), [], None);

  t.deepEqual(node.toJSON(), {
    item: fakeJSON("div"),
    children: [],
  });
});

test(".add() doesn't change a tree that already has the exact same selector", (t) => {
  const item1 = fakeItem("div");
  const item2 = fakeItem("div");
  const node = RuleTree.Node.of(item1, [], None);
  node.add({ ...item2, selector: item1.selector });

  t.deepEqual(node.toJSON(), {
    item: fakeJSON("div"),
    children: [],
  });
});

test(".add() adds a child upon inserting identical selector", (t) => {
  const node = RuleTree.Node.of(fakeItem("div"), [], None);
  node.add(fakeItem("div"));

  t.deepEqual(node.toJSON(), {
    item: fakeJSON("div"),
    children: [{ item: fakeJSON("div"), children: [] }],
  });
});

test("Chaining .add() creates a single branch in the tree", (t) => {
  // Selector `div`, `.foo`, `#bar`, matching, e.g., `<div class="foo" id="bar">`
  // and inserted in increasing specificity.
  const node = RuleTree.Node.of(fakeItem("div"), [], None);
  node.add(fakeItem(".foo")).add(fakeItem("#bar"));

  t.deepEqual(node.toJSON(), {
    item: fakeJSON("div"),
    children: [
      {
        item: fakeJSON(".foo"),
        children: [{ item: fakeJSON("#bar"), children: [] }],
      },
    ],
  });
});

/**
 * Full rule tree tests
 *
 * Since rule tree are stateful, we need to recreate one for each test.
 */
test(".add() creates a single branch in the rule tree", (t) => {
  const tree = RuleTree.empty();
  tree.add([fakeItem("div"), fakeItem(".foo"), fakeItem("#bar")]);

  t.deepEqual(tree.toJSON(), [
    {
      item: fakeJSON("div"),
      children: [
        {
          item: fakeJSON(".foo"),
          children: [{ item: fakeJSON("#bar"), children: [] }],
        },
      ],
    },
  ]);
});

test(".add() does not change the order of items", (t) => {
  const tree = RuleTree.empty();
  // Items are not correctly ordered (#bar has higher specificity). Rule tree
  // doesn't care.
  tree.add([fakeItem("#bar"), fakeItem("div"), fakeItem(".foo")]);

  t.deepEqual(tree.toJSON(), [
    {
      item: fakeJSON("#bar"),
      children: [
        {
          item: fakeJSON("div"),
          children: [{ item: fakeJSON(".foo"), children: [] }],
        },
      ],
    },
  ]);
});

test(".add() duplicate identical but distinct selectors", (t) => {
  const tree = RuleTree.empty();
  // Presumably two rules with selector `div` at different place in the sheet.
  tree.add([fakeItem("div"), fakeItem("div")]);

  t.deepEqual(tree.toJSON(), [
    {
      item: fakeJSON("div"),
      children: [{ item: fakeJSON("div"), children: [] }],
    },
  ]);
});

test(".add() creates separate trees for entries that don't share initial selectors", (t) => {
  const tree = RuleTree.empty();
  // Matching `<div class="foo" id="bar">
  tree.add([fakeItem("div"), fakeItem(".foo"), fakeItem("#bar")]);
  // Matching `<span class="foo" id="bar">`
  // Since the first selector differ, we cannot share any part of the tree
  tree.add([fakeItem("span"), fakeItem(".foo"), fakeItem("#bar")]);

  t.deepEqual(tree.toJSON(), [
    {
      item: fakeJSON("div"),
      children: [
        {
          item: fakeJSON(".foo"),
          children: [{ item: fakeJSON("#bar"), children: [] }],
        },
      ],
    },
    {
      item: fakeJSON("span"),
      children: [
        {
          item: fakeJSON(".foo"),
          children: [{ item: fakeJSON("#bar"), children: [] }],
        },
      ],
    },
  ]);
});

test(".add() share branches as long as selectors are the same", (t) => {
  const div = fakeItem("div");
  const foo = fakeItem(".foo");
  const tree = RuleTree.empty();
  tree.add([div, foo, fakeItem("#bar")]);
  tree.add([div, foo, fakeItem(".baz")]);

  t.deepEqual(tree.toJSON(), [
    {
      item: fakeJSON("div"),
      children: [
        {
          item: fakeJSON(".foo"),
          children: [
            { item: fakeJSON("#bar"), children: [] },
            { item: fakeJSON(".baz"), children: [] },
          ],
        },
      ],
    },
  ]);
});

test(".add() adds descendants when selectors are identical", (t) => {
  const div = fakeItem("div");
  const tree = RuleTree.empty();
  tree.add([div, fakeItem(".foo"), fakeItem("#bar")]);
  tree.add([div, fakeItem(".foo"), fakeItem(".baz")]);

  t.deepEqual(tree.toJSON(), [
    {
      item: fakeJSON("div"),
      children: [
        {
          item: fakeJSON(".foo"),
          children: [
            { item: fakeJSON("#bar"), children: [] },
            {
              item: fakeJSON(".foo"),
              children: [{ item: fakeJSON(".baz"), children: [] }],
            },
          ],
        },
      ],
    },
  ]);
});

test(".add() branches as soon as selectors differ", (t) => {
  const div = fakeItem("div");
  const foo = fakeItem(".foo");
  const tree = RuleTree.empty();
  tree.add([div, foo, fakeItem("#bar")]);
  tree.add([div, fakeItem(".baz"), foo]);

  t.deepEqual(tree.toJSON(), [
    {
      item: fakeJSON("div"),
      children: [
        {
          item: fakeJSON(".foo"),
          children: [{ item: fakeJSON("#bar"), children: [] }],
        },
        {
          item: fakeJSON(".baz"),
          children: [
            {
              item: fakeJSON(".foo"),
              children: [],
            },
          ],
        },
      ],
    },
  ]);
});
