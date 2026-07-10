import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style.ts";

const device = Device.standard();

test("#computed() resolves `line-height: calc(1em + 2px)`", (t) => {
  const element = <div style={{ lineHeight: "calc(1em + 2px)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("line-height").toJSON(), {
    value: {
      type: "length",
      value: 18,
      unit: "px",
    },
    source: h.declaration("line-height", "calc(1em + 2px)").toJSON(),
  });
});

test("#computed() resolves `line-height: calc(1 + 2)`", (t) => {
  const element = <div style={{ lineHeight: "calc(1 + 2)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("line-height").toJSON(), {
    value: {
      type: "number",
      value: 3,
    },
    source: h.declaration("line-height", "calc(1 + 2)").toJSON(),
  });
});

test("#computed() resolves a relative `line-height` without re-entrancy", (t) => {
  const element = <div style={{ lineHeight: "2em", fontSize: "16px" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("line-height").toJSON(), {
    value: {
      type: "length",
      value: 32,
      unit: "px",
    },
    source: h.declaration("line-height", "2em").toJSON(),
  });
});

test("#computed() computes `line-height` of any shape without re-entrancy", (t) => {
  for (const value of [
    "normal",
    "1.5",
    "24px",
    "150%",
    "2em",
    "calc(1em + 2px)",
    "2lh",
    "1rlh",
  ]) {
    const element = <div style={{ lineHeight: value, fontSize: "16px" }} />;

    const style = Style.from(element, device);

    t(style.computed("line-height").value !== undefined);
  }
});

test("#computed() resolves `line-height: 2lh` against the parent's line-height", (t) => {
  const target = <div style={{ lineHeight: "2lh" }} />;

  <div style={{ lineHeight: "20px" }}>{target}</div>;

  const style = Style.from(target, device);

  t.deepEqual(style.computed("line-height").toJSON(), {
    value: {
      type: "length",
      value: 40,
      unit: "px",
    },
    source: h.declaration("line-height", "2lh").toJSON(),
  });
});

test("#computed() resolves `line-height: 2lh` against the initial value when there is no parent", (t) => {
  const element = <div style={{ lineHeight: "2lh" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("line-height").toJSON(), {
    value: {
      type: "length",
      value: 38.4,
      unit: "px",
    },
    source: h.declaration("line-height", "2lh").toJSON(),
  });
});

test("#computed() resolves `line-height: 1rlh` on the root against the initial value", (t) => {
  const element = <div style={{ lineHeight: "1rlh" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("line-height").toJSON(), {
    value: {
      type: "length",
      value: 19.2,
      unit: "px",
    },
    source: h.declaration("line-height", "1rlh").toJSON(),
  });
});

test("#computed() resolves `line-height: 1rlh` against the root's line-height", (t) => {
  const target = <div style={{ lineHeight: "1rlh" }} />;

  <div style={{ lineHeight: "30px" }}>{target}</div>;

  const style = Style.from(target, device);

  t.deepEqual(style.computed("line-height").toJSON(), {
    value: {
      type: "length",
      value: 30,
      unit: "px",
    },
    source: h.declaration("line-height", "1rlh").toJSON(),
  });
});

test("#computed() resolves percentages from the element's `font-size`", (t) => {
  const target = (
    <div style={{ lineHeight: "150%", fontSize: "10px" }}>Hello</div>
  );

  <div style={{ fontSize: "20px" }}>{target}</div>;

  const style = Style.from(target, device);

  t.deepEqual(style.computed("line-height").toJSON(), {
    value: {
      type: "length",
      unit: "px",
      value: 15,
    },
    source: h.declaration("line-height", "150%").toJSON(),
  });
});

test("#computed() resolves `line-height: calc(1lh + 50%)` mixing bases", (t) => {
  // Within a single calculation, each unit resolves against its own base:
  // the percentage against the element's own font-size, and `lh` against the
  // parent's line-height.
  const target = (
    <div style={{ lineHeight: "calc(1lh + 50%)", fontSize: "10px" }}>
      Hello
    </div>
  );

  <div style={{ lineHeight: "20px" }}>{target}</div>;

  const style = Style.from(target, device);

  // 1lh = 20px (parent's line-height) + 50% of 10px (own font-size) = 25px.
  t.deepEqual(style.computed("line-height").toJSON(), {
    value: {
      type: "length",
      unit: "px",
      value: 25,
    },
    source: h.declaration("line-height", "calc(1lh + 50%)").toJSON(),
  });
});

test("#computed() resolves `line-height: calc(1rlh + 50%)` mixing bases", (t) => {
  // Within a single calculation, each unit resolves against its own base:
  // the percentage against the element's own font-size, and `rlh` against
  // the root's line-height.
  const target = (
    <div style={{ lineHeight: "calc(1rlh + 50%)", fontSize: "10px" }}>
      Hello
    </div>
  );

  <div style={{ lineHeight: "30px" }}>{target}</div>;

  const style = Style.from(target, device);

  // 1rlh = 30px (root's line-height) + 50% of 10px (own font-size) = 35px.
  t.deepEqual(style.computed("line-height").toJSON(), {
    value: {
      type: "length",
      unit: "px",
      value: 35,
    },
    source: h.declaration("line-height", "calc(1rlh + 50%)").toJSON(),
  });
});

test("#computed() resolves chained `lh` and `rlh` line-heights down a tree", (t) => {
  const target = <div style={{ lineHeight: "calc(0.5lh + 0.5rlh)" }} />;
  const b = <div style={{ lineHeight: "calc(1lh + 1rlh)" }}>{target}</div>;
  const a = <div style={{ lineHeight: "2lh" }}>{b}</div>;
  const root = <div style={{ lineHeight: "20px" }}>{a}</div>;

  for (const [element, value] of [
    [root, 20],
    [a, 40],
    [b, 60],
    [target, 40],
  ] as const) {
    t.deepEqual(Style.from(element, device).computed("line-height").value.toJSON(), {
      type: "length",
      unit: "px",
      value,
    });
  }
});
