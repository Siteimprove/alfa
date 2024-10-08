import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../dist/style.js";

const device = Device.standard();

test("initial value is `none`", (t) => {
  const element = <div>Hello</div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("scale").toJSON(), {
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
    [h.sheet([h.rule.style(".container", { scale: "2" })])],
  );
  const style = Style.from(element, device);

  t.deepEqual(style.computed("scale").toJSON(), {
    value: { type: "keyword", value: "none" },
    source: null,
  });
});

test("#computed() parses `none`", (t) => {
  const element = <div class="container">Hello</div>;
  const decl = h.declaration("scale", "none");
  h.document([element], [h.sheet([h.rule.style(".container", [decl])])]);
  const style = Style.from(element, device);

  t.deepEqual(style.computed("scale").toJSON(), {
    value: {
      type: "keyword",
      value: "none",
    },
    source: decl.toJSON(),
  });
});

test("#computed() parses a single number", (t) => {
  const element = <div class="container">Hello</div>;
  const decl = h.declaration("scale", "2");
  h.document([element], [h.sheet([h.rule.style(".container", [decl])])]);
  const style = Style.from(element, device);

  t.deepEqual(style.computed("scale").toJSON(), {
    value: {
      type: "transform",
      kind: "scale",
      x: {
        type: "number",
        value: 2,
      },
      y: {
        type: "number",
        value: 2,
      },
    },
    source: decl.toJSON(),
  });
});

test("#computed() parses two values", (t) => {
  const element = <div class="container">Hello</div>;
  const decl = h.declaration("scale", "2 0.5");
  h.document([element], [h.sheet([h.rule.style(".container", [decl])])]);
  const style = Style.from(element, device);

  t.deepEqual(style.computed("scale").toJSON(), {
    value: {
      type: "transform",
      kind: "scale",
      x: {
        type: "number",
        value: 2,
      },
      y: {
        type: "number",
        value: 0.5,
      },
    },
    source: decl.toJSON(),
  });
});

test("#computed() parses three values", (t) => {
  const element = <div class="container">Hello</div>;
  const decl = h.declaration("scale", "200% 50% 200%");
  h.document([element], [h.sheet([h.rule.style(".container", [decl])])]);
  const style = Style.from(element, device);

  t.deepEqual(style.computed("scale").toJSON(), {
    value: {
      type: "transform",
      kind: "scale",
      x: {
        type: "percentage",
        value: 2,
      },
      y: {
        type: "percentage",
        value: 0.5,
      },
      z: {
        type: "percentage",
        value: 2,
      },
    },
    source: decl.toJSON(),
  });
});

test("#computed() does not parse four values", (t) => {
  const element = <div class="container">Hello</div>;
  const decl = h.declaration("scale", "1 2 3 4");
  h.document([element], [h.sheet([h.rule.style(".container", [decl])])]);
  const style = Style.from(element, device);

  t.deepEqual(style.computed("scale").toJSON(), {
    value: {
      type: "keyword",
      value: "none",
    },
    source: null,
  });
});
