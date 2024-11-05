import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../dist/style.js";

const device = Device.standard();

const _0 = { type: "length", unit: "px", value: 0 } as const;

test("initial value is `none`", (t) => {
  const element = <div>Hello</div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("perspective").toJSON(), {
    value: {
      type: "keyword",
      value: "none",
    },
    source: null,
  });
});

test("property is not inherited", (t) => {
  const element = <div>Hello</div>;

  h.document(
    [<div class="container">{element}</div>],
    [
      h.sheet([
        h.rule.style(".container", [h.declaration("perspective", "800px")]),
      ]),
    ],
  );
  const style = Style.from(element, device);

  t.deepEqual(style.computed("perspective").toJSON(), {
    value: { type: "keyword", value: "none" },
    source: null,
  });
});

test("#computed() parses length", (t) => {
  const element = <div class="container">Hello</div>;
  const decl = h.declaration("perspective", "23rem");
  h.document([element], [h.sheet([h.rule.style(".container", [decl])])]);
  const style = Style.from(element, device);

  t.deepEqual(style.computed("perspective").toJSON(), {
    value: {
      type: "transform",
      kind: "perspective",
      depth: {
        type: "length",
        value: 23,
        unit: "rem",
      },
    },
    source: decl.toJSON(),
  });
});
