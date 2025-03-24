import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { test } from "@siteimprove/alfa-test";
import { Cascade } from "../dist/index.js";

import { Block } from "../dist/block.js";
import { Layer, Origin } from "../dist/index.js";

import { authorOrder, getBlock, layer } from "./common/common.js";

const device = Device.standard();

test(".from() builds a cascade with the User Agent style sheet", (t) => {
  const document = h.document([<div>Hello</div>]);
  const cascade = Cascade.from(document, device);

  // Even the "empty" cascade is pretty big due to the UA sheet.
  // We only superficially check the selector map
  t.deepEqual(cascade.toJSON().selectors.types.length, 98);
  t.deepEqual(cascade.toJSON().selectors.other.length, 9);

  t.deepEqual(cascade.toJSON().selectors.ids.length, 0);
  t.deepEqual(cascade.toJSON().selectors.classes.length, 0);
});

// The block of the UA sheet for `<div>` and `<main>`, that are used in tests.
const UAblock: Block.JSON = {
  source: {
    rule: {
      type: "style",
      selector:
        "address, blockquote, center, div, figure, figcaption, footer, form, header, hr, legend, listing, main, p, plaintext, pre, xmp",
      style: [{ name: "display", value: "block", important: false }],
    },
    selector: {
      type: "type",
      specificity: { a: 0, b: 0, c: 1 },
      key: "div",
      name: "div",
      namespace: null,
    },
  },
  declarations: [{ name: "display", value: "block", important: false }],
  precedence: {
    origin: Origin.NormalUserAgent,
    encapsulation: -1,
    isElementAttached: false,
    layer: Layer.of("", false).withOrder(-1).toJSON(),
    specificity: { a: 0, b: 0, c: 1 },
    order: 7,
  },
};

test(".get() returns the rule tree node of the given element", (t) => {
  const div = <div>Hello</div>;
  const rule = h.rule.style("div", { color: "red" });
  const document = h.document(
    [div],
    [h.sheet([rule, h.rule.style("span", { color: "blue" })])],
  );
  const cascade = Cascade.from(document, device);

  // The rule tree has 3 items on the way to the <div>:
  // The fake root, the UA rule `div { display: block }`, and the document rule
  // `div { color: red }`
  // We thus just grab and check the path down from the fake root.
  t.deepEqual(Iterable.toJSON(cascade.get(div).inclusiveAncestors())[2], {
    // fake root
    block: Block.empty().toJSON(),
    children: [
      {
        // UA rule
        block: UAblock,
        children: [{ block: getBlock(rule, authorOrder(0)), children: [] }],
      },
    ],
  });
});

test(".get() fetches `:host` rules from shadow, when relevant.", (t) => {
  const innerNormalRule = h.rule.style(":host(div)", { color: "red" });
  const innerImportantRule = h.rule.style(":host", {
    color: "green !important",
  });
  const outerNormalRule = h.rule.style("div", { color: "blue" });
  const outerImportantRule = h.rule.style("div", {
    color: "yellow !important",
  });
  const ignoredRule = h.rule.style(":host(div)", { color: "black" });
  const div = (
    <div>
      Hello
      {h.shadow(
        [<span></span>],
        [h.sheet([innerNormalRule, innerImportantRule])],
      )}
    </div>
  );
  const document = h.document(
    [div],
    [h.sheet([outerNormalRule, outerImportantRule, ignoredRule])],
  );
  const cascade = Cascade.from(document, device);

  // The rule tree has 6 items on the way to the <div>:
  // The fake root, the UA rule `div { display: block }`, and the 4 rules declared here.
  // We thus just grab and check the path down from the fake root.
  t.deepEqual(Iterable.toJSON(cascade.get(div).inclusiveAncestors())[5], {
    // fake root
    block: Block.empty().toJSON(),
    children: [
      {
        // UA rule
        block: UAblock,
        children: [
          {
            block: getBlock(innerNormalRule, authorOrder(0), 2),
            children: [
              {
                // Rules order is computed separately for each encapsulation context.
                block: getBlock(outerNormalRule, authorOrder(0)),
                children: [
                  {
                    block: getBlock(outerImportantRule, authorOrder(1)),
                    children: [
                      {
                        block: getBlock(innerImportantRule, authorOrder(1), 2),
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
});

test(".get() fetches `:host-context` rules from shadow, when relevant.", (t) => {
  const rules = [
    h.rule.style(":host-context(.foo)", { color: "green" }),
    h.rule.style(":host-context(div)", { color: "red" }),
    h.rule.style(":host-context(.bar)", { color: "blue" }),
  ];
  const div = (
    <div>
      Hello
      {h.shadow([<span></span>], [h.sheet(rules)])}
    </div>
  );
  const document = h.document([<main class="foo">{div}</main>]);
  const cascade = Cascade.from(document, device);

  // The rule tree has 4 items on the way to the <div>:
  // The fake root, the UA rule `div { display: block }`, and the 2 relevant rules declared here.
  // We thus just grab and check the path down from the fake root.
  t.deepEqual(Iterable.toJSON(cascade.get(div).inclusiveAncestors())[3], {
    // fake root
    block: Block.empty().toJSON(),
    children: [
      // The <main> element also generates a node with the UA block, on a separate branch.
      {
        block: {
          ...UAblock,
          source: {
            ...UAblock.source,
            selector: {
              type: "type",
              specificity: { a: 0, b: 0, c: 1 },
              key: "main",
              name: "main",
              namespace: null,
            },
          },
        },
        children: [],
      },
      {
        // UA rule
        block: UAblock,
        children: [
          {
            // The "div" rule is declared first, but also inserted higher due to lower precedence.
            block: getBlock(rules[1], authorOrder(1), 2),
            children: [
              { block: getBlock(rules[0], authorOrder(0), 2), children: [] },
            ],
          },
        ],
      },
    ],
  });
});

test(".get() fetches `::slotted` rules from shadow, when relevant.", (t) => {
  const rules = [
    h.rule.style("::slotted(span)", { color: "red" }),
    h.rule.style("b > ::slotted(.foo)", { color: "blue" }),
    h.rule.style("::slotted(*)", { color: "green" }),
  ];

  const slotted = <div class="foo">Hello</div>;

  const document = h.document([
    <main>
      {slotted}
      {h.shadow(
        [
          <b>
            <slot></slot>
          </b>,
        ],
        [h.sheet(rules)],
      )}
    </main>,
  ]);
  const cascade = Cascade.from(document, device);

  // The rule tree has 4 items on the way to slotted:
  // The fake root, the UA rule `div { display: block }`, and the 2 relevant rules declared here.
  // We thus just grab and check the path down from the fake root.
  t.deepEqual(Iterable.toJSON(cascade.get(slotted).inclusiveAncestors())[3], {
    // fake root
    block: Block.empty().toJSON(),
    children: [
      // The <main> element also generates a node with the UA block, on a separate branch.
      {
        block: {
          ...UAblock,
          source: {
            ...UAblock.source,
            selector: {
              type: "type",
              specificity: { a: 0, b: 0, c: 1 },
              key: "main",
              name: "main",
              namespace: null,
            },
          },
        },
        children: [],
      },
      {
        // UA rule
        block: UAblock,
        children: [
          {
            // Actual rules, skipping the ignored one.
            block: getBlock(rules[2], authorOrder(2), 2),
            children: [
              { block: getBlock(rules[1], authorOrder(1), 2), children: [] },
            ],
          },
        ],
      },
    ],
  });
});

test(".get() matches `::slotted` rules within compound selector.", (t) => {
  const rule = h.rule.style(".foo::slotted(*)", { color: "green" });

  const slotted = <div>Hello</div>;

  const document = h.document([
    <main>
      {slotted}
      {h.shadow([<slot class="foo"></slot>], [h.sheet([rule])])}
    </main>,
  ]);
  const cascade = Cascade.from(document, device);

  // The rule tree has 3 items on the way to slotted:
  // The fake root, the UA rule `div { display: block }`, and the rule declared here.
  // We thus just grab and check the path down from the fake root.
  t.deepEqual(Iterable.toJSON(cascade.get(slotted).inclusiveAncestors())[2], {
    // fake root
    block: Block.empty().toJSON(),
    children: [
      // The <main> element also generates a node with the UA block, on a separate branch.
      {
        block: {
          ...UAblock,
          source: {
            ...UAblock.source,
            selector: {
              type: "type",
              specificity: { a: 0, b: 0, c: 1 },
              key: "main",
              name: "main",
              namespace: null,
            },
          },
        },
        children: [],
      },
      {
        // UA rule
        block: UAblock,
        children: [{ block: getBlock(rule, authorOrder(0), 2), children: [] }],
      },
    ],
  });
});

test(".get() correctly sort rules from different depths.", (t) => {
  const outerNormalRule = h.rule.style("div", { color: "blue" });
  const outerImportantRule = h.rule.style("div", {
    color: "yellow !important",
  });
  const middleNormalRule = h.rule.style("::slotted(*)", { color: "cyan" });
  const middleImportantRule = h.rule.style("::slotted(*)", {
    color: "magenta !important",
  });
  const innerNormalRule = h.rule.style(":host", { color: "green" });
  const innerImportantRule = h.rule.style(":host", {
    color: "red !important",
  });

  const target = (
    <div>
      {h.shadow(
        [<span>Hello</span>],
        [h.sheet([innerNormalRule, innerImportantRule])],
      )}
    </div>
  );

  const document = h.document(
    [
      <main>
        {target}
        {h.shadow(
          [<slot></slot>],
          [h.sheet([middleNormalRule, middleImportantRule])],
        )}
      </main>,
    ],
    [h.sheet([outerNormalRule, outerImportantRule])],
  );
  // Resulting flat tree:
  // #document  <- has outer rules, apply to the target div.
  // main
  // +-- #shadow <- has middle rules, apply to the slotted target div.
  //     slot
  //     +-- div [target, defined in the light, slotted, hosting]
  //         +-- #shadow  <- has inner rules, apply to the hosting target div.
  //             span
  const cascade = Cascade.from(document, device);

  // The rule tree has 8 items on the way to target:
  // The fake root, the UA rule `div { display: block }`, and the 6 rules declared here.
  // We thus just grab and check the path down from the fake root.
  t.deepEqual(Iterable.toJSON(cascade.get(target).inclusiveAncestors())[7], {
    // fake root
    block: Block.empty().toJSON(),
    children: [
      // The <main> element also generates a node with the UA block, on a separate branch.
      {
        block: {
          ...UAblock,
          source: {
            ...UAblock.source,
            selector: {
              type: "type",
              specificity: { a: 0, b: 0, c: 1 },
              key: "main",
              name: "main",
              namespace: null,
            },
          },
        },
        children: [],
      },
      {
        // UA rule
        block: UAblock,
        children: [
          {
            // Actual rules, rules are ordered separately in each encapsulation context.
            block: getBlock(innerNormalRule, authorOrder(0), 3),
            children: [
              {
                block: getBlock(middleNormalRule, authorOrder(0), 2),
                children: [
                  {
                    block: getBlock(outerNormalRule, authorOrder(0), 1),
                    children: [
                      {
                        block: getBlock(outerImportantRule, authorOrder(1), 1),
                        children: [
                          {
                            block: getBlock(
                              middleImportantRule,
                              authorOrder(1),
                              2,
                            ),
                            children: [
                              {
                                block: getBlock(
                                  innerImportantRule,
                                  authorOrder(1),
                                  3,
                                ),
                                children: [],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
});

test(".get() respects layer ordering", (t) => {
  const div = (
    <div class="my-class" id="my-id">
      Hello
    </div>
  );

  const rule0 = h.rule.style("div", { color: "red" });
  const rule1 = h.rule.style("div", { color: "black !important" });
  const rule2 = h.rule.style(".my-class", { color: "blue !important" });
  const rule3 = h.rule.style("#my-id", { color: "green" });

  const document = h.document(
    [div],
    [
      h.sheet([
        h.rule.layerStatement(["lorem", "ipsum", "dolor"]),
        h.rule.layerBlock([rule0], "dolor"),
        h.rule.layerBlock([rule1], "ipsum"),
        h.rule.layerBlock([rule2, h.rule.layerBlock([rule3], "sit")], "lorem"),
      ]),
    ],
  );
  const cascade = Cascade.from(document, device);

  // The rule tree has 6 items on the way to the <div>:
  // The fake root, the UA rule `div { display: block }`, and the 4 rules here.
  // We thus just grab and check the path down from the fake root.
  t.deepEqual(Iterable.toJSON(cascade.get(div).inclusiveAncestors())[5], {
    // fake root
    block: Block.empty().toJSON(),
    children: [
      {
        // UA rule
        block: UAblock,
        children: [
          {
            // Normal rules, last declared layer first.
            block: getBlock(rule3, authorOrder(3), 1, layer("lorem.sit", 5)),
            children: [
              {
                block: getBlock(rule0, authorOrder(0), 1, layer("dolor", 2)),
                children: [
                  {
                    // important rules, first declared layer first.
                    block: getBlock(
                      rule1,
                      authorOrder(1),
                      1,
                      layer("ipsum", 3),
                    ),
                    children: [
                      {
                        block: getBlock(
                          rule2,
                          authorOrder(2),
                          1,
                          layer("lorem", 4),
                        ),
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
});
