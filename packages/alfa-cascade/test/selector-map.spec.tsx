import { Array } from "@siteimprove/alfa-array";
import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import {
  Complex,
  Compound,
  Context,
  type Simple,
} from "@siteimprove/alfa-selector";
import { parse } from "@siteimprove/alfa-selector/test/parser";
import { test } from "@siteimprove/alfa-test";
import { AncestorFilter } from "../src/ancestor-filter";

import { Layer, Origin } from "../src/precedence";
import { SelectorMap } from "../src/selector-map";
import { layer, ruleToBlockJSON } from "./common";

const device = Device.standard();

test(".from() builds a selector map with a single rule", (t) => {
  const rule = h.rule.style("div", { foo: "not parsed" });
  const actual = SelectorMap.from([h.sheet([rule])], device, 1);

  t.deepEqual(actual.toJSON(), {
    ids: [],
    classes: [],
    types: [["div", ruleToBlockJSON(rule, 0)]],
    other: [],
    shadow: [],
  });
});

test(".from() rejects rules with invalid selectors", (t) => {
  const actual = SelectorMap.from(
    [h.sheet([h.rule.style(":non-existent", { foo: "not parsed" })])],
    device,
    1,
  );

  t.deepEqual(actual.toJSON(), {
    ids: [],
    classes: [],
    types: [],
    other: [],
    shadow: [],
  });
});

test(".from() stores rules in increasing order, amongst all non-disabled sheets", (t) => {
  const rules = [
    h.rule.style("foo", { foo: "bar" }),
    h.rule.style("bar", { foo: "bar" }),
    h.rule.style(".bar", { foo: "bar" }),
    h.rule.style(".foo", { foo: "bar" }),
    h.rule.style("#hello", { foo: "bar" }),
    h.rule.style(":focus", { foo: "bar" }),
    h.rule.style(":host", { foo: "bar" }),
  ];

  const actual = SelectorMap.from(
    [
      h.sheet([rules[0], rules[1]]),
      h.sheet([rules[2]]),
      h.sheet([h.rule.style("div", { foo: "bar" })], true),
      h.sheet([rules[3], rules[4]]),
      h.sheet([rules[5], rules[6]]),
    ],
    device,
    1,
  );

  // Each block is computed with an order equal to the index of the rule in the array.
  // This is what we want because rules are inserted in order in the sheets.
  const blocks = rules.map((rule, order) => ruleToBlockJSON(rule, order));

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
    shadow: blocks[6],
  });
});

test(".from() split important and non-important declarations in two blocks", (t) => {
  const rule = h.rule.style("div", { foo: "bar", hello: "world !important" });
  const selector = parse("div") as Compound | Complex | Simple;
  const actual = SelectorMap.from([h.sheet([rule])], device, 1);

  // Each of the split blocks contain the full rule (with both declarations), but only one
  // of the declarations.
  t.deepEqual(actual.toJSON(), {
    ids: [],
    classes: [],
    types: [
      [
        "div",
        [
          {
            source: { rule: rule.toJSON(), selector: selector.toJSON() },
            declarations: [{ name: "foo", value: "bar", important: false }],
            precedence: {
              origin: Origin.NormalAuthor,
              encapsulation: -1,
              isElementAttached: false,
              layer: Layer.of("", false).withOrder(-1).toJSON(),
              specificity: { a: 0, b: 0, c: 1 },
              order: 1,
            },
          },
          {
            source: { rule: rule.toJSON(), selector: selector.toJSON() },
            declarations: [{ name: "hello", value: "world", important: true }],
            precedence: {
              origin: Origin.ImportantAuthor,
              encapsulation: 1,
              isElementAttached: false,
              layer: Layer.of("", true).withOrder(1).toJSON(),
              specificity: { a: 0, b: 0, c: 1 },
              order: 1,
            },
          },
        ],
      ],
    ],
    other: [],
    shadow: [],
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
    1,
  );

  t.deepEqual(actual.toJSON(), {
    ids: [],
    classes: [],
    types: [["foo", ruleToBlockJSON(rule, 0)]],
    other: [],
    shadow: [],
  });
});

test(".from() only recurses into import rules whose media condition match the device", (t) => {
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
    1,
  );

  t.deepEqual(actual.toJSON(), {
    ids: [],
    classes: [],
    types: [["foo", ruleToBlockJSON(rule, 0)]],
    other: [],
    shadow: [],
  });
});

test(".from() only recurses into import rules whose support condition match the device", (t) => {
  const rule = h.rule.style("foo", { foo: "bar" });
  const actual = SelectorMap.from(
    [
      h.sheet([
        h.rule.importRule("foo.com", h.sheet([rule]), undefined, "foo: bar"),
      ]),
      h.sheet([
        h.rule.importRule(
          "bar.com",
          h.sheet([h.rule.style("bar", { foo: "bar" })]),
          undefined,
          "-foo: bar",
        ),
      ]),
    ],
    device,
    1,
  );

  t.deepEqual(actual.toJSON(), {
    ids: [],
    classes: [],
    types: [["foo", ruleToBlockJSON(rule, 0)]],
    other: [],
    shadow: [],
  });
});

test(".from() only recurses into import rules when both media and support conditions match the device", (t) => {
  const rule = h.rule.style("foo", { foo: "bar" });
  const actual = SelectorMap.from(
    [
      h.sheet([
        h.rule.importRule("foo.com", h.sheet([rule]), "screen", "foo: bar"),
      ]),
      h.sheet([
        h.rule.importRule(
          "bar.com",
          h.sheet([h.rule.style("bar", { foo: "bar" })]),
          "screen",
          "-foo: bar",
        ),
        h.rule.importRule(
          "bar.com",
          h.sheet([h.rule.style("bar", { foo: "bar" })]),
          "print",
          "-foo: bar",
        ),
        h.rule.importRule(
          "bar.com",
          h.sheet([h.rule.style("bar", { foo: "bar" })]),
          "print",
          "foo: bar",
        ),
      ]),
    ],
    device,
    1,
  );

  t.deepEqual(actual.toJSON(), {
    ids: [],
    classes: [],
    types: [["foo", ruleToBlockJSON(rule, 0)]],
    other: [],
    shadow: [],
  });
});

test(".from() only recurses into supports rules whose condition matches", (t) => {
  const rule = h.rule.style("foo", { foo: "bar" });
  const actual = SelectorMap.from(
    [
      // correct generic property
      h.sheet([h.rule.supports("(foo: bar)", [rule])]),
      // incorrect, vendor prefix
      h.sheet([
        h.rule.supports("(-foo: bar)", [h.rule.style("bar", { foo: "bar" })]),
      ]),
      // incorrect syntax, parsing fails
      h.sheet([
        h.rule.supports("foo: bar", [h.rule.style("bar", { foo: "bar" })]),
      ]),
    ],
    device,
    1,
  );

  t.deepEqual(actual.toJSON(), {
    ids: [],
    classes: [],
    types: [["foo", ruleToBlockJSON(rule, 0)]],
    other: [],
    shadow: [],
  });
});

test(".from() recurses into block layer rules", (t) => {
  const rule = h.rule.style("foo", { foo: "bar" });

  const actual = SelectorMap.from(
    [h.sheet([h.rule.layerBlock([rule], "hello")])],
    device,
    1,
  );

  t.deepEqual(actual.toJSON(), {
    ids: [],
    classes: [],
    types: [["foo", ruleToBlockJSON(rule, 0, 1, layer("hello", 2))]],
    other: [],
    shadow: [],
  });
});

test(".from() creates anonymous layer for unammed layer block rules", (t) => {
  const rule = h.rule.style("foo", { foo: "bar" });

  const actual = SelectorMap.from(
    [h.sheet([h.rule.layerBlock([rule])])],
    device,
    1,
  );

  t.deepEqual(actual.toJSON(), {
    ids: [],
    classes: [],
    types: [["foo", ruleToBlockJSON(rule, 0, 1, layer("(anonymous 1)", 2))]],
    other: [],
    shadow: [],
  });
});

test(".from() orders incomparable layers in reverse declaration order", (t) => {
  const rule1 = h.rule.style("type", { foo: "bar" });
  const rule2 = h.rule.style(".class", { foo: "bar" });
  const rule3 = h.rule.style("#id", { foo: "bar" });

  const actual = SelectorMap.from(
    [
      h.sheet([
        h.rule.layerBlock([rule1], "lorem"),
        h.rule.layerBlock([rule2], "ipsum"),
        h.rule.layerBlock([rule3], "dolor"),
      ]),
    ],
    device,
    1,
  );

  t.deepEqual(actual.toJSON(), {
    ids: [["id", ruleToBlockJSON(rule3, 2, 1, layer("dolor", 2))]],
    classes: [["class", ruleToBlockJSON(rule2, 1, 1, layer("ipsum", 3))]],
    types: [["type", ruleToBlockJSON(rule1, 0, 1, layer("lorem", 4))]],
    other: [],
    shadow: [],
  });
});

test(".from() orders comparable layers in reverse nesting order", (t) => {
  const rule1 = h.rule.style("type", { foo: "bar" });
  const rule2 = h.rule.style(".class", { foo: "bar" });
  const rule3 = h.rule.style("#id", { foo: "bar" });

  const actual = SelectorMap.from(
    [
      h.sheet([
        h.rule.layerBlock([rule1], "lorem.ipsum.dolor"),
        h.rule.layerBlock([rule2], "lorem"),
        h.rule.layerBlock([rule3], "lorem.ipsum"),
      ]),
    ],
    device,
    1,
  );

  t.deepEqual(actual.toJSON(), {
    ids: [["id", ruleToBlockJSON(rule3, 2, 1, layer("lorem.ipsum", 3))]],
    classes: [["class", ruleToBlockJSON(rule2, 1, 1, layer("lorem", 2))]],
    types: [
      ["type", ruleToBlockJSON(rule1, 0, 1, layer("lorem.ipsum.dolor", 4))],
    ],
    other: [],
    shadow: [],
  });
});

test(".from() creates sublayers for nested layer block rules", (t) => {
  const rule1 = h.rule.style("type", { foo: "bar" });
  const rule2 = h.rule.style(".class", { foo: "bar" });
  const rule3 = h.rule.style("#id", { foo: "bar" });

  const actual = SelectorMap.from(
    [
      h.sheet([
        h.rule.layerBlock(
          [
            rule1,
            h.rule.layerBlock([rule2, h.rule.layerBlock([rule3], "dolor")]),
          ],
          "lorem",
        ),
      ]),
    ],
    device,
    1,
  );

  t.deepEqual(actual.toJSON(), {
    ids: [
      [
        "id",
        ruleToBlockJSON(rule3, 2, 1, layer("lorem.(anonymous 1).dolor", 4)),
      ],
    ],
    classes: [
      ["class", ruleToBlockJSON(rule2, 1, 1, layer("lorem.(anonymous 1)", 3))],
    ],
    types: [["type", ruleToBlockJSON(rule1, 0, 1, layer("lorem", 2))]],
    other: [],
    shadow: [],
  });
});

test(".form() order layers according to statement rules coming before block rules", (t) => {
  const rule1 = h.rule.style("type", { foo: "bar" });
  const rule2 = h.rule.style(".class", { foo: "bar" });
  const rule3 = h.rule.style("#id", { foo: "bar" });

  const actual = SelectorMap.from(
    [
      h.sheet([
        h.rule.layerStatement(["lorem", "ipsum", "dolor"]),
        h.rule.layerBlock([rule1], "dolor"),
        h.rule.layerBlock([rule2], "ipsum"),
        h.rule.layerBlock([rule3], "lorem"),
      ]),
    ],
    device,
    1,
  );

  t.deepEqual(actual.toJSON(), {
    ids: [["id", ruleToBlockJSON(rule3, 2, 1, layer("lorem", 4))]],
    classes: [["class", ruleToBlockJSON(rule2, 1, 1, layer("ipsum", 3))]],
    types: [["type", ruleToBlockJSON(rule1, 0, 1, layer("dolor", 2))]],
    other: [],
    shadow: [],
  });
});

test(".form() order layers according to block rules coming before statement rules", (t) => {
  const rule1 = h.rule.style("type", { foo: "bar" });
  const rule2 = h.rule.style(".class", { foo: "bar" });
  const rule3 = h.rule.style("#id", { foo: "bar" });

  const actual = SelectorMap.from(
    [
      h.sheet([
        h.rule.layerBlock([rule1], "dolor"),
        h.rule.layerBlock([rule2], "ipsum"),
        h.rule.layerBlock([rule3], "lorem"),
        h.rule.layerStatement(["lorem", "ipsum", "dolor"]),
      ]),
    ],
    device,
    1,
  );

  t.deepEqual(actual.toJSON(), {
    ids: [["id", ruleToBlockJSON(rule3, 2, 1, layer("lorem", 2))]],
    classes: [["class", ruleToBlockJSON(rule2, 1, 1, layer("ipsum", 3))]],
    types: [["type", ruleToBlockJSON(rule1, 0, 1, layer("dolor", 4))]],
    other: [],
    shadow: [],
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
  const map = SelectorMap.from([h.sheet(rules)], device, 1);

  const blocks = rules.map((rule, order) => ruleToBlockJSON(rule, order));

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
  const map = SelectorMap.from([h.sheet(rules)], device, 1);
  const blocks = rules.map((rule, order) => ruleToBlockJSON(rule, order));

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

test("#get() does not return shadow rules", (t) => {
  const rules = [
    h.rule.style("div", { foo: "bar" }),
    h.rule.style(":host(div)", { hello: "world" }),
  ];

  const map = SelectorMap.from([h.sheet(rules)], device, 1);
  const blocks = rules.map((rule, order) => ruleToBlockJSON(rule, order));
  const element = <div></div>;

  t.deepEqual(
    Array.toJSON([
      ...map.get(element, Context.empty(), AncestorFilter.empty()),
    ]),
    blocks[0],
  );
});

test("#getForHost() only returns shadow rules", (t) => {
  const rules = [
    h.rule.style("div", { foo: "bar" }),
    h.rule.style(":host(div)", { hello: "world" }),
  ];

  const map = SelectorMap.from([h.sheet(rules)], device, 1);
  const blocks = rules.map((rule, order) => ruleToBlockJSON(rule, order));
  const element = <div></div>;

  t.deepEqual(
    Array.toJSON([...map.getForHost(element, Context.empty())]),
    blocks[1],
  );
});
