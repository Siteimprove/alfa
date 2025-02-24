import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { type Assertions, test } from "@siteimprove/alfa-test";

import { Style } from "../../dist/index.js";

import { cascaded, computed } from "../common.js";

function parse(
  t: Assertions,
  property: "overflow-wrap" | "word-wrap",
  value: Style.Computed<"overflow-wrap">["value"],
): void {
  const element = <div />;
  const declaration = h.declaration(property, value);

  h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

  for (const prop of ["overflow-wrap", "word-wrap"] as const) {
    t.deepEqual(cascaded(element, prop), {
      value: { type: "keyword", value: value },
      source: declaration.toJSON(),
    });

    t.deepEqual(computed(element, prop), {
      value: { type: "keyword", value: value },
      source: declaration.toJSON(),
    });
  }
}

test("overflow-wrap sets both overflow-wrap and word-wrap", (t) => {
  parse(t, "overflow-wrap", "break-word");
});

test("word-wrap sets both overflow-wrap and word-wrap", (t) => {
  parse(t, "word-wrap", "break-word");
});

test("overflow-wrap overrides word-wrap", (t) => {
  const element = <div />;

  h.document(
    [element],
    [
      h.sheet([
        h.rule.style("div", { "word-wrap": "normal" }),
        h.rule.style("div", { "overflow-wrap": "break-word" }),
      ]),
    ],
  );

  for (const prop of ["overflow-wrap", "word-wrap"] as const) {
    t.deepEqual(cascaded(element, prop), {
      value: { type: "keyword", value: "break-word" },
      source: h.declaration("overflow-wrap", "break-word").toJSON(),
    });
  }
});

test("word-wrap overrides overflow-wrap", (t) => {
  const element = <div />;

  h.document(
    [element],
    [
      h.sheet([
        h.rule.style("div", { "overflow-wrap": "break-word" }),
        h.rule.style("div", { "word-wrap": "normal" }),
      ]),
    ],
  );

  for (const prop of ["overflow-wrap", "word-wrap"] as const) {
    t.deepEqual(cascaded(element, prop), {
      value: { type: "keyword", value: "normal" },
      source: h.declaration("word-wrap", "normal").toJSON(),
    });
  }
});
