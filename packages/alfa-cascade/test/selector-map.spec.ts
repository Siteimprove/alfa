import { Array } from "@siteimprove/alfa-array";
import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";
import { SelectorMap } from "../src/selector-map";

import { Block } from "../src/block";

const device = Device.standard();

test(".from() builds a selector map with a single rule", (t) => {
  const actual = SelectorMap.from(
    [h.sheet([h.rule.style("div", { foo: "not parsed" })])],
    device,
  );

  t.deepEqual(actual.toJSON(), {
    ids: [],
    classes: [],
    types: [
      [
        "div",
        [
          {
            declarations: [
              { important: false, name: "foo", value: "not parsed" },
            ],
            precedence: {
              order: 1,
              origin: 2,
              specificity: { a: 0, b: 0, c: 1 },
            },
            rule: {
              selector: "div",
              style: [{ important: false, name: "foo", value: "not parsed" }],
              type: "style",
            },
            selector: {
              key: "div",
              name: "div",
              namespace: null,
              specificity: { a: 0, b: 0, c: 1 },
              type: "type",
            },
          },
        ],
      ],
    ],
    other: [],
  });
});

test(".from() rejects rules w%ith invalid selectors", (t) => {
  const actual = SelectorMap.from(
    [h.sheet([h.rule.style(":non-existent", { foo: "not parsed" })])],
    device,
  );

  t.deepEqual(actual.toJSON(), { ids: [], classes: [], types: [], other: [] });
});

test(".from() stores rules in increasing order, amongst all sheets", (t) => {
  const rules = [
    h.rule.style("foo", { foo: "bar" }),
    h.rule.style("bar", { foo: "bar" }),
    h.rule.style(".bar", { foo: "bar" }),
    h.rule.style(".foo", { foo: "bar" }),
    h.rule.style("#hello", { foo: "bar" }),
    h.rule.style("::focus", { foo: "bar" }),
  ];

  const actual = SelectorMap.from(
    [
      h.sheet([rules[0], rules[1]]),
      h.sheet([rules[2]]),
      h.sheet([rules[3], rules[4]]),
      h.sheet([rules[5]]),
    ],
    device,
  );

  const blocks = rules
    // Each block is computed with an order equal to the index of the rule in the array.
    // This is what we want because rules are inserted in order in the sheets.
    .map(Block.from)
    .map(([blocks, _]) => Array.toJSON(blocks));

  t.deepEqual(actual.toJSON(), {
    ids: [["hello", blocks[4]]],
    classes: [
      ["bar", blocks[2]],
      ["foo", blocks[3]],
    ],
    types: [
      ["foo", blocks[0]],
      ["bar", blocks[1]],
    ],
    other: blocks[5],
  });
});
