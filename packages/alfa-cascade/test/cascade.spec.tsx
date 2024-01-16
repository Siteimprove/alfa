import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { test } from "@siteimprove/alfa-test";

import { Block } from "../src/block";
import { Cascade } from "../src";

const device = Device.standard();

test(".from() builds a cascade with the User Agent style sheet", (t) => {
  const document = h.document([<div>Hello</div>]);
  const cascade = Cascade.from(document, device);

  // Even the "empty" cascade is pretty big due to the UA sheet.
  // We only superficially check the selector map
  t.deepEqual(cascade.toJSON().selectors.types.length, 96);
  t.deepEqual(cascade.toJSON().selectors.other.length, 8);

  t.deepEqual(cascade.toJSON().selectors.ids.length, 0);
  t.deepEqual(cascade.toJSON().selectors.classes.length, 0);
});

test(".get() returns the rule tree node of the given element", (t) => {
  const div = <div>Hello</div>;
  const rule = h.rule.style("div", { color: "red" });
  const document = h.document([div], [h.sheet([rule])]);
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
        block: {
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
            origin: 1,
            isElementAttached: false,
            specificity: { a: 0, b: 0, c: 1 },
            order: 7,
          },
        },
        children: [
          {
            // Actual rule
            // There are 58 rules in the UA sheet.
            block: Block.from(rule, 58)[0][0].toJSON(),
            children: [],
          },
        ],
      },
    ],
  });
});
