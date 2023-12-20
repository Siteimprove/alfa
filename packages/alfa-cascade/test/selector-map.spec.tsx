import { Array } from "@siteimprove/alfa-array";
import { Device } from "@siteimprove/alfa-device";
import { h, StyleRule } from "@siteimprove/alfa-dom";
import { Context } from "@siteimprove/alfa-selector";
import { test } from "@siteimprove/alfa-test";
import { AncestorFilter } from "../src/ancestor-filter";
import { SelectorMap } from "../src/selector-map";

import { Block } from "../src/block";

const device = Device.standard();

function ruleToBlockJSON(rule: StyleRule, order: number): Array<Block.JSON> {
  return Array.toJSON(Block.from(rule, order)[0]);
}

/**
 * This initial test should have the full explicit JSON rather than rely on ruleToBlockJSON
 * in order to circumvent possible issues in Block.from.
 */
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

test(".from() rejects rules with invalid selectors", (t) => {
  const actual = SelectorMap.from(
    [h.sheet([h.rule.style(":non-existent", { foo: "not parsed" })])],
    device,
  );

  t.deepEqual(actual.toJSON(), { ids: [], classes: [], types: [], other: [] });
});

test(".from() stores rules in increasing order, amongst all non-disabled sheets", (t) => {
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
      h.sheet([h.rule.style("div", { foo: "bar" })], true),
      h.sheet([rules[3], rules[4]]),
      h.sheet([rules[5]]),
    ],
    device,
  );

  // Each block is computed with an order equal to the index of the rule in the array.
  // This is what we want because rules are inserted in order in the sheets.
  const blocks = rules.map(ruleToBlockJSON);

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

test(".from() only recurses into media rules that match the device", (t) => {
  const rule = h.rule.style("foo", { foo: "bar" });
  const actual = SelectorMap.from(
    [
      h.sheet([h.rule.media("screen", [rule])]),
      h.sheet([h.rule.media("print", [h.rule.style("bar", { foo: "bar" })])]),
    ],
    device,
  );

  t.deepEqual(actual.toJSON(), {
    ids: [],
    classes: [],
    types: [["foo", ruleToBlockJSON(rule, 0)]],
    other: [],
  });
});

test(".from() only recurses into import rules that match the device", (t) => {
  const rule = h.rule.style("foo", { foo: "bar" });
  const actual = SelectorMap.from(
    [
      h.sheet([h.rule.importRule("foo.com", h.sheet([rule]), "screen")]),
      h.sheet([
        h.rule.importRule(
          "bar.com",
          h.sheet([h.rule.style("bar", { foo: "bar" })]),
          "print",
        ),
      ]),
    ],
    device,
  );

  t.deepEqual(actual.toJSON(), {
    ids: [],
    classes: [],
    types: [["foo", ruleToBlockJSON(rule, 0)]],
    other: [],
  });
});

test("#get() returns all blocks whose selector match an element", (t) => {
  const rules = [
    h.rule.style("div", { foo: "bar" }),
    h.rule.style("span", { foo: "bar" }),
    h.rule.style(".bar", { foo: "bar" }),
    h.rule.style(".foo", { foo: "bar" }),
    h.rule.style("#hello", { foo: "bar" }),
    h.rule.style("::focus", { foo: "bar" }),
  ];
  const map = SelectorMap.from([h.sheet(rules)], device);

  const blocks = rules.map(ruleToBlockJSON);

  const element = <div class="foo"></div>;

  t.deepEqual(
    Array.toJSON([
      ...map.get(element, Context.empty(), AncestorFilter.empty()),
    ]),
    [...blocks[0], ...blocks[3]],
  );
});

/**
 * This test uses an incorrect ancestor filter to show that it takes precedence
 * over the actual matching of the selector.
 */
test("#get() respects ancestor filter", (t) => {
  const rules = [
    h.rule.style("span", { foo: "foo" }),
    h.rule.style("div span", { bar: "bar" }),
  ];
  const map = SelectorMap.from([h.sheet(rules)], device);
  const blocks = rules.map(ruleToBlockJSON);

  const badFilter = AncestorFilter.empty();
  badFilter.add(<main></main>);

  const goodFilter = AncestorFilter.empty();
  goodFilter.add(<main></main>);
  goodFilter.add(<div></div>);

  const target = <span>Hello</span>;
  const _ = <div>{target}</div>;

  // The filter is incorrect by not having the `<div>` and therefore rejects the `div span` rule.
  t.deepEqual(
    Array.toJSON([...map.get(target, Context.empty(), badFilter)]),
    blocks[0],
  );

  // The filter is correct and let the `div span` rule be matched.
  t.deepEqual(
    Array.toJSON([...map.get(target, Context.empty(), goodFilter)]),
    blocks[0].concat(blocks[1]),
  );
});
