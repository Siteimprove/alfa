import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Style } from "../../dist/style.js";
import { color } from "../common.js";

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
