import { Array } from "@siteimprove/alfa-array";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Block } from "../src/block";
import { Origin } from "../src/precedence";
import { Encapsulation } from "../src/precedence/encapsulation";

test(".from() creates a single block for a simple rule", (t) => {
  const declaration = h.declaration("color", "red");
  const rule = h.rule.style("a", [declaration]);

  t.deepEqual(Array.toJSON(Block.from(rule, 0)), [
    [
      {
        source: {
          rule: rule.toJSON(),
          selector: {
            type: "type",
            key: "a",
            name: "a",
            namespace: null,
            specificity: { a: 0, b: 0, c: 1 },
          },
        },
        declarations: [declaration.toJSON()],
        precedence: {
          origin: Origin.NormalAuthor,
          encapsulation: Encapsulation.NormalOuter,
          isElementAttached: false,
          specificity: { a: 0, b: 0, c: 1 },
          order: 1,
        },
      },
    ],
    1,
  ]);
});

test(".from() respects order", (t) => {
  const declaration = h.declaration("color", "red");
  const rule = h.rule.style("a", [declaration]);

  t.deepEqual(Array.toJSON(Block.from(rule, 41)), [
    [
      {
        source: {
          rule: rule.toJSON(),
          selector: {
            type: "type",
            key: "a",
            name: "a",
            namespace: null,
            specificity: { a: 0, b: 0, c: 1 },
          },
        },
        declarations: [declaration.toJSON()],
        precedence: {
          origin: Origin.NormalAuthor,
          encapsulation: Encapsulation.NormalOuter,
          isElementAttached: false,
          specificity: { a: 0, b: 0, c: 1 },
          order: 42,
        },
      },
    ],
    42,
  ]);
});

test(".from() splits blocks by selector and importance, with the same order", (t) => {
  const normal = h.declaration("color", "red");
  const important = h.declaration("display", "block", true);
  const rule = h.rule.style("a, .foo", [normal, important]);

  t.deepEqual(Array.toJSON(Block.from(rule, 0)), [
    [
      {
        source: {
          rule: rule.toJSON(),
          selector: {
            type: "type",
            key: "a",
            name: "a",
            namespace: null,
            specificity: { a: 0, b: 0, c: 1 },
          },
        },
        declarations: [normal.toJSON()],
        precedence: {
          origin: Origin.NormalAuthor,
          encapsulation: Encapsulation.NormalOuter,
          isElementAttached: false,
          specificity: { a: 0, b: 0, c: 1 },
          order: 1,
        },
      },
      {
        source: {
          rule: rule.toJSON(),
          selector: {
            type: "class",
            key: ".foo",
            name: "foo",
            specificity: { a: 0, b: 1, c: 0 },
          },
        },
        declarations: [normal.toJSON()],
        precedence: {
          origin: Origin.NormalAuthor,
          encapsulation: Encapsulation.NormalOuter,
          isElementAttached: false,
          specificity: { a: 0, b: 1, c: 0 },
          order: 1,
        },
      },
      {
        source: {
          rule: rule.toJSON(),
          selector: {
            type: "type",
            key: "a",
            name: "a",
            namespace: null,
            specificity: { a: 0, b: 0, c: 1 },
          },
        },
        declarations: [important.toJSON()],
        precedence: {
          origin: Origin.ImportantAuthor,
          encapsulation: Encapsulation.ImportantOuter,
          isElementAttached: false,
          specificity: { a: 0, b: 0, c: 1 },
          order: 1,
        },
      },
      {
        source: {
          rule: rule.toJSON(),
          selector: {
            type: "class",
            key: ".foo",
            name: "foo",
            specificity: { a: 0, b: 1, c: 0 },
          },
        },
        declarations: [important.toJSON()],
        precedence: {
          origin: Origin.ImportantAuthor,
          encapsulation: Encapsulation.ImportantOuter,
          isElementAttached: false,
          specificity: { a: 0, b: 1, c: 0 },
          order: 1,
        },
      },
    ],
    1,
  ]);
});

test(".from() marks shadow selectors as encapsulated", (t) => {
  const declaration = h.declaration("color", "red");
  const rule = h.rule.style(":host", [declaration]);

  t.deepEqual(Array.toJSON(Block.from(rule, 0)), [
    [
      {
        source: {
          rule: rule.toJSON(),
          selector: {
            type: "pseudo-class",
            name: "host",
            specificity: { a: 0, b: 1, c: 0 },
          },
        },
        declarations: [declaration.toJSON()],
        precedence: {
          origin: Origin.NormalAuthor,
          encapsulation: Encapsulation.NormalInner,
          isElementAttached: false,
          specificity: { a: 0, b: 1, c: 0 },
          order: 1,
        },
      },
    ],
    1,
  ]);
});

test(".fromStyle() creates blocks for a style attribute", (t) => {
  const element = <div style={{ color: "red", display: "block !important" }} />;

  t.deepEqual(Array.toJSON([...Block.fromStyle(element)]), [
    {
      source: element.toJSON(),
      declarations: [h.declaration("color", "red").toJSON()],
      precedence: {
        origin: Origin.NormalAuthor,
        encapsulation: Encapsulation.NormalOuter,
        isElementAttached: true,
        specificity: { a: 0, b: 1, c: 0 },
        order: -1,
      },
    },
    {
      source: element.toJSON(),
      declarations: [
        h.declaration("display", "block !important", true).toJSON(),
      ],
      precedence: {
        origin: Origin.ImportantAuthor,
        encapsulation: Encapsulation.ImportantOuter,
        isElementAttached: true,
        specificity: { a: 0, b: 1, c: 0 },
        order: -1,
      },
    },
  ]);
});
