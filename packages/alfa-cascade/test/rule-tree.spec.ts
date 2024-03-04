import { h } from "@siteimprove/alfa-dom";
import { None } from "@siteimprove/alfa-option";
import { Complex, Compound, type Simple } from "@siteimprove/alfa-selector";

import { parse } from "@siteimprove/alfa-selector/test/parser";
import { test } from "@siteimprove/alfa-test";
import { RuleTree } from "../src";

import { Block } from "../src/block";
import { Layer, Origin, Precedence } from "../src/precedence";

function fakeBlock(
  selectorText: string,
  precedence?: Partial<Precedence<true>>,
): Block<Block.Source, true> {
  const {
    origin = Origin.NormalUserAgent,
    encapsulation = -1,
    isElementAttached = false,
    layer = Layer.empty(),
  } = precedence ?? {};

  const selector = parse(selectorText) as Compound | Complex | Simple;

  return Block.of({ rule: h.rule.style(selectorText, []), selector }, [], {
    origin,
    encapsulation,
    isElementAttached,
    layer,
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

test(".add() sort items by precedence", (t) => {
  const block1 = fakeBlock("div", { origin: Origin.ImportantUserAgent });
  const block2 = fakeBlock("div", { encapsulation: 1 });
  const block3 = fakeBlock("div", { origin: Origin.NormalAuthor });
  const block4 = fakeBlock("div");
  const block5 = fakeBlock(".foo");

  const tree = RuleTree.empty();
  tree.add([block1, block2, block3, block4, block5]);

  t.deepEqual(tree.toJSON(), [
    {
      block: block4.toJSON(), // normal UA, (0, 0, 1)
      children: [
        {
          block: block5.toJSON(), // normal UA, (0, 1, 0)
          children: [
            {
              block: block2.toJSON(), // higher encapsulated
              children: [
                {
                  block: block3.toJSON(), // normal author
                  children: [{ block: block1.toJSON(), children: [] }], // important UA
                },
              ],
            },
          ],
        },
      ],
    },
  ]);
});

test(".add() adds several block when a rule has both normal and important declarations", (t) => {
  const blocks = (
    Block.from(
      h.rule.style("div", { foo: "bar", hello: "world !important" }),
      0,
      1,
      {
        normal: Layer.of("", false).withOrder(0),
        important: Layer.of("", true).withOrder(0),
      },
    )[0] as Array<Block<Block.Source, true>>
  ).sort(Block.compare);

  const tree = RuleTree.empty();
  tree.add(blocks);

  t.deepEqual(tree.toJSON(), [
    {
      block: blocks[0].toJSON(),
      children: [{ block: blocks[1].toJSON(), children: [] }],
    },
  ]);
});
