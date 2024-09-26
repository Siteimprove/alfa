import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../dist/style.js";

const device = Device.standard();

const _0 = { type: "length", unit: "px", value: 0 } as const;

test("initial value is `none`", (t) => {
  const element = <div>Hello</div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("translate").toJSON(), {
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
    [h.sheet([h.rule.style(".container", [h.declaration("translate", "2")])])],
  );
  const style = Style.from(element, device);

  t.deepEqual(style.computed("translate").toJSON(), {
    value: { type: "keyword", value: "none" },
    source: null,
  });
});

test("#computed() parses `none`", (t) => {
  const element = <div class="container">Hello</div>;
  const decl = h.declaration("translate", "none");
  h.document([element], [h.sheet([h.rule.style(".container", [decl])])]);
  const style = Style.from(element, device);

  t.deepEqual(style.computed("translate").toJSON(), {
    value: {
      type: "keyword",
      value: "none",
    },
    source: decl.toJSON(),
  });
});

test("#computed() parses a single length", (t) => {
  const element = <div class="container">Hello</div>;
  const decl = h.declaration("translate", "1px");
  h.document([element], [h.sheet([h.rule.style(".container", [decl])])]);
  const style = Style.from(element, device);

  t.deepEqual(style.computed("translate").toJSON(), {
    value: {
      type: "transform",
      kind: "translate",
      x: {
        type: "length",
        unit: "px",
        value: 1,
      },
      y: _0,
      z: _0,
    },
    source: decl.toJSON(),
  });
});

test("#computed() parses two percentages", (t) => {
  const element = <div class="container">Hello</div>;
  const decl = h.declaration("translate", "10% 20%");
  h.document([element], [h.sheet([h.rule.style(".container", [decl])])]);
  const style = Style.from(element, device);

  t.deepEqual(style.computed("translate").toJSON(), {
    value: {
      type: "transform",
      kind: "translate",
      x: {
        type: "percentage",
        value: 0.1,
      },
      y: {
        type: "percentage",
        value: 0.2,
      },
      z: _0,
    },
    source: decl.toJSON(),
  });
});

test("#computed() parses three lengths", (t) => {
  const element = <div class="container">Hello</div>;
  const decl = h.declaration("translate", "20px 4rem 150px");
  h.document([element], [h.sheet([h.rule.style(".container", [decl])])]);
  const style = Style.from(element, device);

  t.deepEqual(style.computed("translate").toJSON(), {
    value: {
      type: "transform",
      kind: "translate",
      x: {
        type: "length",
        unit: "px",
        value: 20,
      },
      y: {
        type: "length",
        unit: "rem",
        value: 4,
      },
      z: {
        type: "length",
        unit: "px",
        value: 150,
      },
    },
    source: decl.toJSON(),
  });
});

test("#computed() rejects percentage in z component", (t) => {
  const element = <div class="container">Hello</div>;
  const decl = h.declaration("translate", "20px 4rem 50%");
  h.document([element], [h.sheet([h.rule.style(".container", [decl])])]);
  const style = Style.from(element, device);

  t.deepEqual(style.computed("translate").toJSON(), {
    value: {
      type: "keyword",
      value: "none",
    },
    source: null,
  });
});

test("#computed() rejects four lengths", (t) => {
  const element = <div class="container">Hello</div>;
  const decl = h.declaration("translate", "20px 4rem 150px 150px");
  h.document([element], [h.sheet([h.rule.style(".container", [decl])])]);
  const style = Style.from(element, device);

  t.deepEqual(style.computed("translate").toJSON(), {
    value: {
      type: "keyword",
      value: "none",
    },
    source: null,
  });
});
