import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Style } from "../../src/style.ts";
import { color } from "../common.ts";

const device = Device.standard();

test("#computed() resolves `outline-offset: calc(1em + 2px)`", (t) => {
  const element = <div style={{ outlineOffset: "calc(1em + 2px)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("outline-offset").toJSON(), {
    value: {
      type: "length",
      value: 18,
      unit: "px",
    },
    source: h.declaration("outline-offset", "calc(1em + 2px)").toJSON(),
  });
});

test("#computed() resolves `lh` against a length `line-height`", (t) => {
  const element = (
    <div style={{ outlineOffset: "2lh", lineHeight: "24px" }} />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.computed("outline-offset").toJSON(), {
    value: {
      type: "length",
      value: 48,
      unit: "px",
    },
    source: h.declaration("outline-offset", "2lh").toJSON(),
  });
});

test("#computed() resolves `lh` against a numeric `line-height` and the font size", (t) => {
  const element = (
    <div style={{ outlineOffset: "1lh", lineHeight: "2", fontSize: "10px" }} />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.computed("outline-offset").toJSON(), {
    value: {
      type: "length",
      value: 20,
      unit: "px",
    },
    source: h.declaration("outline-offset", "1lh").toJSON(),
  });
});

test("#computed() resolves `lh` against a `normal` line-height as 1.2 times the font size", (t) => {
  const element = (
    <div
      style={{ outlineOffset: "1lh", lineHeight: "normal", fontSize: "10px" }}
    />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.computed("outline-offset").toJSON(), {
    value: {
      type: "length",
      value: 12,
      unit: "px",
    },
    source: h.declaration("outline-offset", "1lh").toJSON(),
  });
});

test("#computed() resolves `rlh` against the root element's line-height", (t) => {
  const target = <div style={{ outlineOffset: "2rlh" }} />;

  <div style={{ lineHeight: "32px" }}>{target}</div>;

  const style = Style.from(target, device);

  t.deepEqual(style.computed("outline-offset").toJSON(), {
    value: {
      type: "length",
      value: 64,
      unit: "px",
    },
    source: h.declaration("outline-offset", "2rlh").toJSON(),
  });
});

test("#computed() resolves `rlh` against a `normal` root line-height and the root font size", (t) => {
  const target = <div style={{ outlineOffset: "1rlh" }} />;

  <div style={{ lineHeight: "normal", fontSize: "10px" }}>{target}</div>;

  const style = Style.from(target, device);

  t.deepEqual(style.computed("outline-offset").toJSON(), {
    value: {
      type: "length",
      value: 12,
      unit: "px",
    },
    source: h.declaration("outline-offset", "1rlh").toJSON(),
  });
});

test("#computed() rejects `outline-offset: calc(1 + 2)`", (t) => {
  const element = <div style={{ outlineOffset: "calc(1 + 2)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("outline-offset").toJSON(), {
    // initial value
    value: {
      type: "length",
      value: 0,
      unit: "px",
    },
    source: null,
  });
});

test("#computed() resolves `outline-width: calc(1em + 2px)`", (t) => {
  const element = (
    <div style={{ outlineWidth: "calc(1em + 2px)", outlineStyle: "solid" }} />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.computed("outline-width").toJSON(), {
    value: {
      type: "length",
      value: 18,
      unit: "px",
    },
    source: h.declaration("outline-width", "calc(1em + 2px)").toJSON(),
  });
});

test("#computed() resolves `outline: solid calc(1em + 2px) red`", (t) => {
  const element = <div style={{ outline: "solid calc(1em + 2px) red" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("outline-style").toJSON(), {
    value: {
      type: "keyword",
      value: "solid",
    },
    source: h.declaration("outline", "solid calc(1em + 2px) red").toJSON(),
  });

  t.deepEqual(style.computed("outline-width").toJSON(), {
    value: {
      type: "length",
      value: 18,
      unit: "px",
    },
    source: h.declaration("outline", "solid calc(1em + 2px) red").toJSON(),
  });

  t.deepEqual(style.computed("outline-color").toJSON(), {
    value: color(1, 0, 0),
    source: h.declaration("outline", "solid calc(1em + 2px) red").toJSON(),
  });
});

test("#computed() resolves `outline-offset: max(1em, 2px)`", (t) => {
  const element = <div style={{ outlineOffset: "max(1em, 2px)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("outline-offset").toJSON(), {
    value: {
      type: "length",
      value: 16,
      unit: "px",
    },
    source: h.declaration("outline-offset", "max(1em, 2px)").toJSON(),
  });
});
