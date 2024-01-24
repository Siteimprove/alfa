import { h } from "@siteimprove/alfa-dom";
import { None } from "@siteimprove/alfa-option";
import {
  Complex,
  Compound,
  type Simple,
  Specificity,
} from "@siteimprove/alfa-selector";

import { parse } from "@siteimprove/alfa-selector/test/parser";
import { test } from "@siteimprove/alfa-test";
import { RuleTree } from "../src";

import { Block } from "../src/block";
import { Origin } from "../src/precedence";
import { Encapsulation } from "../src/precedence/encapsulation";

function fakeBlock(
  selectorText: string,
  origin: Origin = Origin.NormalUserAgent,
): Block {
  const selector = parse(selectorText) as Compound | Complex | Simple;

  return Block.of({ rule: h.rule.style(selectorText, []), selector }, [], {
    origin,
    encapsulation: -1,
    isElementAttached: false,
    specificity: selector.specificity,
    order: -1,
  });
}

// Selectors `div`, `.foo`, `#bar`, matching, e.g., `<div class="foo" id="bar">`
// and inserted in increasing specificity.
const div = fakeBlock("div");
const divJSON = div.toJSON();
const dotfoo = fakeBlock(".foo");
const dotfooJSON = dotfoo.toJSON();
const hashbar = fakeBlock("#bar");
const hashbarJSON = hashbar.toJSON();

const dotbaz = fakeBlock(".baz");
const dotbazJSON = dotbaz.toJSON();

/**
 * Node tests
 */
test(".of() builds a node", (t) => {
  const node = RuleTree.Node.of(div, [], None);

  t.deepEqual(node.toJSON(), { block: divJSON, children: [] });
});

test(".add() doesn't change a tree that already has the exact same selector", (t) => {
  const item2 = fakeBlock("div");
  const node = RuleTree.Node.of(div, [], None);
  node.add(
    // This is not a mistake, we want to share the exact same selector but have otherwise different parts.
    Block.of(
      { rule: item2.rule!, selector: div.selector! },
      item2.declarations,
      item2.precedence,
    ),
  );

  t.deepEqual(node.toJSON(), { block: divJSON, children: [] });
});

test(".add() adds a child upon inserting identical selector", (t) => {
  const node = RuleTree.Node.of(div, [], None);
  const div2 = fakeBlock("div");
  node.add(div2);

  t.deepEqual(node.toJSON(), {
    block: divJSON,
    children: [{ block: div2.toJSON(), children: [] }],
  });
});

test("Chaining .add() creates a single branch in the tree", (t) => {
  const node = RuleTree.Node.of(div, [], None);
  node.add(dotfoo).add(hashbar);

  t.deepEqual(node.toJSON(), {
    block: divJSON,
    children: [
      { block: dotfooJSON, children: [{ block: hashbarJSON, children: [] }] },
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
  tree.add([div, dotfoo, hashbar]);

  t.deepEqual(tree.toJSON(), [
    {
      block: divJSON,
      children: [
        { block: dotfooJSON, children: [{ block: hashbarJSON, children: [] }] },
      ],
    },
  ]);
});

test(".add() duplicate identical but distinct selectors", (t) => {
  const tree = RuleTree.empty();
  // Presumably two rules with selector `div` at different place in the sheet.
  const item2 = fakeBlock("div");
  tree.add([div, item2]);

  t.deepEqual(tree.toJSON(), [
    { block: divJSON, children: [{ block: item2.toJSON(), children: [] }] },
  ]);
});

test(".add() creates separate trees for entries that don't share initial selectors", (t) => {
  const tree = RuleTree.empty();
  // Matching `<div class="foo" id="bar">
  tree.add([div, dotfoo, hashbar]);
  // Matching `<span class="foo" id="bar">`
  // Since the first selector differ, we cannot share any part of the tree
  const span = fakeBlock("span");
  tree.add([span, dotfoo, hashbar]);

  t.deepEqual(tree.toJSON(), [
    {
      block: divJSON,
      children: [
        { block: dotfooJSON, children: [{ block: hashbarJSON, children: [] }] },
      ],
    },
    {
      block: span.toJSON(),
      children: [
        { block: dotfooJSON, children: [{ block: hashbarJSON, children: [] }] },
      ],
    },
  ]);
});

test(".add() share branches as long as selectors are the same", (t) => {
  const tree = RuleTree.empty();
  tree.add([div, dotfoo, hashbar]);
  tree.add([div, dotfoo, dotbaz]);

  t.deepEqual(tree.toJSON(), [
    {
      block: divJSON,
      children: [
        {
          block: dotfooJSON,
          children: [
            { block: hashbarJSON, children: [] },
            { block: dotbazJSON, children: [] },
          ],
        },
      ],
    },
  ]);
});

test(".add() adds descendants when selectors are merely identical", (t) => {
  const tree = RuleTree.empty();
  tree.add([div, dotfoo, hashbar]);
  // This is not an actual possible case. This corresponds to two `.foo`
  // selectors but each matches different elements, which is impossible.
  // Hence, the adding of the .foo / .baz branch under the initial .foo
  // looks very wrong but is actually the correct thing to do. In an actual
  // case, both .add would contain both .foo selector, since this rules with
  // identical selectors match the same elements.
  const foo2 = fakeBlock(".foo");
  tree.add([div, foo2, dotbaz]);

  t.deepEqual(tree.toJSON(), [
    {
      block: divJSON,
      children: [
        {
          block: dotfooJSON,
          children: [
            { block: hashbarJSON, children: [] },
            {
              block: foo2.toJSON(),
              children: [{ block: dotbazJSON, children: [] }],
            },
          ],
        },
      ],
    },
  ]);
});

test(".add() branches as soon as selectors differ", (t) => {
  const tree = RuleTree.empty();
  tree.add([div, dotfoo, hashbar]);
  // Even if the selector is the same, the tree doesn't try to merge the branches.
  tree.add([div, dotbaz, dotfoo]);

  t.deepEqual(tree.toJSON(), [
    {
      block: divJSON,
      children: [
        { block: dotfooJSON, children: [{ block: hashbarJSON, children: [] }] },
        { block: dotbazJSON, children: [{ block: dotfooJSON, children: [] }] },
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
      block: divJSON,
      children: [
        {
          block: dotfooJSON,
          children: [{ block: hashbarJSON, children: [] }],
        },
      ],
    },
  ]);
});

test(".add() sort items by origin and importance", (t) => {
  const UAImportant = fakeBlock("div", Origin.ImportantUserAgent);
  const UANormal = fakeBlock("div", Origin.NormalUserAgent);
  const AuthorImportant = fakeBlock("div", Origin.ImportantAuthor);
  const AuthorNormal = fakeBlock("div", Origin.NormalAuthor);

  const tree = RuleTree.empty();
  tree.add([UAImportant, UANormal, AuthorImportant, AuthorNormal]);

  t.deepEqual(tree.toJSON(), [
    {
      block: UANormal.toJSON(),
      children: [
        {
          block: AuthorNormal.toJSON(),
          children: [
            {
              block: AuthorImportant.toJSON(),
              children: [{ block: UAImportant.toJSON(), children: [] }],
            },
          ],
        },
      ],
    },
  ]);
});

test(".add() prioritise origin over specificity", (t) => {
  const highSpecificity = fakeBlock("#foo", Origin.ImportantAuthor);
  const highOrigin = fakeBlock("div", Origin.ImportantUserAgent);

  const tree = RuleTree.empty();
  tree.add([highSpecificity, highOrigin]);

  t.deepEqual(tree.toJSON(), [
    {
      block: highSpecificity.toJSON(),
      children: [{ block: highOrigin.toJSON(), children: [] }],
    },
  ]);
});

test(".add() prioritise style attribute over specificity", (t) => {
  const highSpecificityImportant = fakeBlock("#foo", Origin.ImportantAuthor);
  const highSpecificityNormal = fakeBlock("#bar", Origin.NormalAuthor);
  const styleAttributeImportant = Block.of(h.element("div"), [], {
    origin: Origin.ImportantAuthor,
    encapsulation: -1,
    isElementAttached: true,
    specificity: Specificity.empty(),
    order: -1,
  });
  const styleAttributeNormal = Block.of(h.element("span"), [], {
    origin: Origin.NormalAuthor,
    encapsulation: -1,
    isElementAttached: true,
    specificity: Specificity.empty(),
    order: -1,
  });

  const tree = RuleTree.empty();
  tree.add([
    highSpecificityImportant,
    highSpecificityNormal,
    styleAttributeImportant,
    styleAttributeNormal,
  ]);

  t.deepEqual(tree.toJSON(), [
    {
      block: highSpecificityNormal.toJSON(),
      children: [
        {
          block: styleAttributeNormal.toJSON(),
          children: [
            {
              block: highSpecificityImportant.toJSON(),
              children: [
                {
                  block: styleAttributeImportant.toJSON(),
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
