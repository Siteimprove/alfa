import { h } from "@siteimprove/alfa-dom";
import { None } from "@siteimprove/alfa-option";
import { Complex, Compound, type Simple } from "@siteimprove/alfa-selector";

import { parse } from "@siteimprove/alfa-selector/test/parser";
import { test } from "@siteimprove/alfa-test";
import { RuleTree } from "../src";

import { Block } from "../src/block";
import { Origin } from "../src/precedence";

function fakeBlock(
  selector: string,
  origin: Origin = Origin.NormalUserAgent,
  importance: boolean = false,
): Block {
  const sel = parse(selector) as Compound | Complex | Simple;

  return Block.of(h.rule.style(selector, []), sel, [], {
    origin,
    importance,
    specificity: sel.specificity,
    order: -1,
  });
}

function fakeJSON(
  selector: string,
  origin?: Origin,
  importance?: boolean,
): Block.JSON {
  return fakeBlock(selector, origin, importance).toJSON();
}

/**
 * Node tests
 */
test(".of() builds a node", (t) => {
  const node = RuleTree.Node.of(fakeBlock("div"), [], None);

  t.deepEqual(node.toJSON(), {
    block: fakeJSON("div"),
    children: [],
  });
});

test(".add() doesn't change a tree that already has the exact same selector", (t) => {
  const item1 = fakeBlock("div");
  const item2 = fakeBlock("div");
  const node = RuleTree.Node.of(item1, [], None);
  // This is not a mistake, we want to share the exact same selector but have otherwise different parts.
  node.add(
    Block.of(item2.rule, item1.selector, item2.declarations, item2.precedence),
  );

  t.deepEqual(node.toJSON(), {
    block: fakeJSON("div"),
    children: [],
  });
});

test(".add() adds a child upon inserting identical selector", (t) => {
  const node = RuleTree.Node.of(fakeBlock("div"), [], None);
  node.add(fakeBlock("div"));

  t.deepEqual(node.toJSON(), {
    block: fakeJSON("div"),
    children: [{ block: fakeJSON("div"), children: [] }],
  });
});

test("Chaining .add() creates a single branch in the tree", (t) => {
  // Selectors `div`, `.foo`, `#bar`, matching, e.g., `<div class="foo" id="bar">`
  // and inserted in increasing specificity.
  const node = RuleTree.Node.of(fakeBlock("div"), [], None);
  node.add(fakeBlock(".foo")).add(fakeBlock("#bar"));

  t.deepEqual(node.toJSON(), {
    block: fakeJSON("div"),
    children: [
      {
        block: fakeJSON(".foo"),
        children: [{ block: fakeJSON("#bar"), children: [] }],
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
  tree.add([fakeBlock("div"), fakeBlock(".foo"), fakeBlock("#bar")]);

  t.deepEqual(tree.toJSON(), [
    {
      block: fakeJSON("div"),
      children: [
        {
          block: fakeJSON(".foo"),
          children: [{ block: fakeJSON("#bar"), children: [] }],
        },
      ],
    },
  ]);
});

test(".add() duplicate identical but distinct selectors", (t) => {
  const tree = RuleTree.empty();
  // Presumably two rules with selector `div` at different place in the sheet.
  tree.add([fakeBlock("div"), fakeBlock("div")]);

  t.deepEqual(tree.toJSON(), [
    {
      block: fakeJSON("div"),
      children: [{ block: fakeJSON("div"), children: [] }],
    },
  ]);
});

test(".add() creates separate trees for entries that don't share initial selectors", (t) => {
  const tree = RuleTree.empty();
  // Matching `<div class="foo" id="bar">
  tree.add([fakeBlock("div"), fakeBlock(".foo"), fakeBlock("#bar")]);
  // Matching `<span class="foo" id="bar">`
  // Since the first selector differ, we cannot share any part of the tree
  tree.add([fakeBlock("span"), fakeBlock(".foo"), fakeBlock("#bar")]);

  t.deepEqual(tree.toJSON(), [
    {
      block: fakeJSON("div"),
      children: [
        {
          block: fakeJSON(".foo"),
          children: [{ block: fakeJSON("#bar"), children: [] }],
        },
      ],
    },
    {
      block: fakeJSON("span"),
      children: [
        {
          block: fakeJSON(".foo"),
          children: [{ block: fakeJSON("#bar"), children: [] }],
        },
      ],
    },
  ]);
});

test(".add() share branches as long as selectors are the same", (t) => {
  const div = fakeBlock("div");
  const foo = fakeBlock(".foo");
  const tree = RuleTree.empty();
  tree.add([div, foo, fakeBlock("#bar")]);
  tree.add([div, foo, fakeBlock(".baz")]);

  t.deepEqual(tree.toJSON(), [
    {
      block: fakeJSON("div"),
      children: [
        {
          block: fakeJSON(".foo"),
          children: [
            { block: fakeJSON("#bar"), children: [] },
            { block: fakeJSON(".baz"), children: [] },
          ],
        },
      ],
    },
  ]);
});

test(".add() adds descendants when selectors are merely identical", (t) => {
  const div = fakeBlock("div");
  const tree = RuleTree.empty();
  tree.add([div, fakeBlock(".foo"), fakeBlock("#bar")]);
  // This is not an actual possible case. This corresponds to two `.foo`
  // selectors but each matches different elements, which is impossible.
  // Hence, the adding of the .foo / .baz branch under the initial .foo
  // looks very wrong but is actually the correct thing to do. In an actual
  // case, both .add would contain both .foo selector, since this rules with
  // identical selectors match the same elements.
  tree.add([div, fakeBlock(".foo"), fakeBlock(".baz")]);

  t.deepEqual(tree.toJSON(), [
    {
      block: fakeJSON("div"),
      children: [
        {
          block: fakeJSON(".foo"),
          children: [
            { block: fakeJSON("#bar"), children: [] },
            {
              block: fakeJSON(".foo"),
              children: [{ block: fakeJSON(".baz"), children: [] }],
            },
          ],
        },
      ],
    },
  ]);
});

test(".add() branches as soon as selectors differ", (t) => {
  const div = fakeBlock("div");
  const foo = fakeBlock(".foo");
  const tree = RuleTree.empty();
  tree.add([div, foo, fakeBlock("#bar")]);
  // Even if the selector is the same, the tree doesn't try to merge the branches.
  tree.add([div, fakeBlock(".baz"), foo]);

  t.deepEqual(tree.toJSON(), [
    {
      block: fakeJSON("div"),
      children: [
        {
          block: fakeJSON(".foo"),
          children: [{ block: fakeJSON("#bar"), children: [] }],
        },
        {
          block: fakeJSON(".baz"),
          children: [
            {
              block: fakeJSON(".foo"),
              children: [],
            },
          ],
        },
      ],
    },
  ]);
});

/**
 * Sorting blocks upon insertion
 */
test(".add() sort items by specificity", (t) => {
  const tree = RuleTree.empty();
  tree.add([fakeBlock("#bar"), fakeBlock("div"), fakeBlock(".foo")]);

  t.deepEqual(tree.toJSON(), [
    {
      block: fakeJSON("div"),
      children: [
        {
          block: fakeJSON(".foo"),
          children: [{ block: fakeJSON("#bar"), children: [] }],
        },
      ],
    },
  ]);
});

test(".add() sort items by origin and importance", (t) => {
  const UAImportant = fakeBlock("div", Origin.ImportantUserAgent, true);
  const UANormal = fakeBlock("div", Origin.NormalUserAgent);
  const AuthorImportant = fakeBlock("div", Origin.ImportantAuthor, true);
  const AuthorNormal = fakeBlock("div", Origin.NormalAuthor);

  const tree = RuleTree.empty();
  tree.add([UAImportant, UANormal, AuthorImportant, AuthorNormal]);

  t.deepEqual(tree.toJSON(), [
    {
      block: fakeJSON("div", Origin.NormalUserAgent),
      children: [
        {
          block: fakeJSON("div", Origin.NormalAuthor),
          children: [
            {
              block: fakeJSON("div", Origin.ImportantAuthor, true),
              children: [
                {
                  block: fakeJSON("div", Origin.ImportantUserAgent, true),
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ]);
});

test(".add() prioritise origin over specificity", (t) => {
  const highSpecificity = fakeBlock("#foo", Origin.ImportantAuthor, true);
  const highOrigin = fakeBlock("div", Origin.ImportantUserAgent, true);

  const tree = RuleTree.empty();
  tree.add([highSpecificity, highOrigin]);

  t.deepEqual(tree.toJSON(), [
    {
      block: fakeJSON("#foo", Origin.ImportantAuthor, true),
      children: [
        {
          block: fakeJSON("div", Origin.ImportantUserAgent, true),
          children: [],
        },
      ],
    },
  ]);
});
