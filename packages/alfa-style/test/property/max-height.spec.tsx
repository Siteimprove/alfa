import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../dist/style.js";
import { cascaded } from "../common.js";

const device = Device.standard();

test("#cascaded() parses `max-height: none`", (t) => {
  const element = <div style={{ maxHeight: "none" }} />;

  t.deepEqual(cascaded(element, "max-height"), {
    value: { type: "keyword", value: "none" },
    source: h.declaration("max-height", "none").toJSON(),
  });
});

test("#cascaded() parses `max-height: 100px`", (t) => {
  const element = <div style={{ maxHeight: "100px" }} />;

  t.deepEqual(cascaded(element, "max-height"), {
    value: { type: "length", value: 100, unit: "px" },
    source: h.declaration("max-height", "100px").toJSON(),
  });
});

test("#cascaded() parses `max-height: 50%`", (t) => {
  const element = <div style={{ maxHeight: "50%" }} />;

  t.deepEqual(cascaded(element, "max-height"), {
    value: { type: "percentage", value: 0.5 },
    source: h.declaration("max-height", "50%").toJSON(),
  });
});

test("#cascaded() parses `max-height: max-content`", (t) => {
  const element = <div style={{ maxHeight: "max-content" }} />;

  t.deepEqual(cascaded(element, "max-height"), {
    value: { type: "keyword", value: "max-content" },
    source: h.declaration("max-height", "max-content").toJSON(),
  });
});

test("#cascaded() parses `max-height: min-content`", (t) => {
  const element = <div style={{ maxHeight: "min-content" }} />;

  t.deepEqual(cascaded(element, "max-height"), {
    value: { type: "keyword", value: "min-content" },
    source: h.declaration("max-height", "min-content").toJSON(),
  });
});

test("#cascaded() parses `max-height: fit-content`", (t) => {
  const element = <div style={{ maxHeight: "fit-content" }} />;

  t.deepEqual(cascaded(element, "max-height"), {
    value: { type: "keyword", value: "fit-content" },
    source: h.declaration("max-height", "fit-content").toJSON(),
  });
});

test("#computed() resolves `max-height: 100px`", (t) => {
  const element = <div style={{ maxHeight: "100px" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("max-height").toJSON(), {
    value: { type: "length", value: 100, unit: "px" },
    source: h.declaration("max-height", "100px").toJSON(),
  });
});

test("#computed() resolves `max-height: 5em`", (t) => {
  const element = <div style={{ maxHeight: "5em" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("max-height").toJSON(), {
    value: { type: "length", value: 80, unit: "px" },
    source: h.declaration("max-height", "5em").toJSON(),
  });
});

test("#computed() preserves `max-height: 50%`", (t) => {
  const element = <div style={{ maxHeight: "50%" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("max-height").toJSON(), {
    value: { type: "percentage", value: 0.5 },
    source: h.declaration("max-height", "50%").toJSON(),
  });
});

test("#computed() preserves `max-height: none`", (t) => {
  const element = <div style={{ maxHeight: "none" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("max-height").toJSON(), {
    value: { type: "keyword", value: "none" },
    source: h.declaration("max-height", "none").toJSON(),
  });
});

test("#computed() preserves `max-height: max-content`", (t) => {
  const element = <div style={{ maxHeight: "max-content" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("max-height").toJSON(), {
    value: { type: "keyword", value: "max-content" },
    source: h.declaration("max-height", "max-content").toJSON(),
  });
});
