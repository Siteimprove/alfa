import { Array } from "@siteimprove/alfa-array";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Block } from "../dist/block.js";
import { Layer, Origin } from "../dist/index.js";

const noLayer = { normal: Layer.empty(), important: Layer.empty() };

test(".from() creates a single block for a simple rule", (t) => {
  const declaration = h.declaration("color", "red");
  const rule = h.rule.style("a", [declaration]);

  t.deepEqual(Array.toJSON(Block.from(rule, 0, 1, noLayer)), [
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
          encapsulation: -1,
          isElementAttached: false,
          layer: Layer.empty().toJSON(),
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

  t.deepEqual(Array.toJSON(Block.from(rule, 41, 1, noLayer)), [
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
          encapsulation: -1,
          isElementAttached: false,
          layer: Layer.empty().toJSON(),
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
  const normalLayer = Layer.of("foo", false).withOrder(2);
  const importantLayer = Layer.of("bar", true).withOrder(-2);

  t.deepEqual(
    Array.toJSON(
      Block.from(rule, 0, 1, {
        normal: normalLayer,
        important: importantLayer,
      }),
    ),
    [
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
            encapsulation: -1,
            isElementAttached: false,
            layer: normalLayer.toJSON(),
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
            encapsulation: -1,
            isElementAttached: false,
            layer: normalLayer.toJSON(),
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
            encapsulation: 1,
            isElementAttached: false,
            layer: importantLayer.toJSON(),
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
            encapsulation: 1,
            isElementAttached: false,
            layer: importantLayer.toJSON(),
            specificity: { a: 0, b: 1, c: 0 },
            order: 1,
          },
        },
      ],
      1,
    ],
  );
});

test(".from() respects encapsulation depth", (t) => {
  const declaration = h.declaration("color", "red");
  const rule = h.rule.style(":host", [declaration]);

  t.deepEqual(Array.toJSON(Block.from(rule, 0, 42, noLayer)), [
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
          encapsulation: -42,
          isElementAttached: false,
          layer: Layer.empty().toJSON(),
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

  t.deepEqual(Array.toJSON([...Block.fromStyle(element, 1)]), [
    {
      source: element.toJSON(),
      declarations: [h.declaration("color", "red").toJSON()],
      precedence: {
        origin: Origin.NormalAuthor,
        encapsulation: -1,
        isElementAttached: true,
        layer: Layer.empty().toJSON(),
        specificity: { a: 0, b: 0, c: 0 },
        order: -1,
      },
    },
    {
      source: element.toJSON(),
      declarations: [h.declaration("display", "block", true).toJSON()],
      precedence: {
        origin: Origin.ImportantAuthor,
        encapsulation: 1,
        isElementAttached: true,
        layer: Layer.empty().toJSON(),
        specificity: { a: 0, b: 0, c: 0 },
        order: -1,
      },
    },
  ]);
});
