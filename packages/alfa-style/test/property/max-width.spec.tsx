import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../dist/style.js";
import { cascaded } from "../common.js";

const device = Device.standard();

test("#cascaded() parses `max-width: none`", (t) => {
  const element = <div style={{ maxWidth: "none" }} />;

  t.deepEqual(cascaded(element, "max-width"), {
    value: { type: "keyword", value: "none" },
    source: h.declaration("max-width", "none").toJSON(),
  });
});

test("#cascaded() parses `max-width: 100px`", (t) => {
  const element = <div style={{ maxWidth: "100px" }} />;

  t.deepEqual(cascaded(element, "max-width"), {
    value: { type: "length", value: 100, unit: "px" },
    source: h.declaration("max-width", "100px").toJSON(),
  });
});

test("#cascaded() parses `max-width: 50%`", (t) => {
  const element = <div style={{ maxWidth: "50%" }} />;

  t.deepEqual(cascaded(element, "max-width"), {
    value: { type: "percentage", value: 0.5 },
    source: h.declaration("max-width", "50%").toJSON(),
  });
});

test("#cascaded() parses `max-width: max-content`", (t) => {
  const element = <div style={{ maxWidth: "max-content" }} />;

  t.deepEqual(cascaded(element, "max-width"), {
    value: { type: "keyword", value: "max-content" },
    source: h.declaration("max-width", "max-content").toJSON(),
  });
});

test("#cascaded() parses `max-width: min-content`", (t) => {
  const element = <div style={{ maxWidth: "min-content" }} />;

  t.deepEqual(cascaded(element, "max-width"), {
    value: { type: "keyword", value: "min-content" },
    source: h.declaration("max-width", "min-content").toJSON(),
  });
});

test("#cascaded() parses `max-width: fit-content`", (t) => {
  const element = <div style={{ maxWidth: "fit-content" }} />;

  t.deepEqual(cascaded(element, "max-width"), {
    value: { type: "keyword", value: "fit-content" },
    source: h.declaration("max-width", "fit-content").toJSON(),
  });
});

test("#computed() resolves `max-width: 100px`", (t) => {
  const element = <div style={{ maxWidth: "100px" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("max-width").toJSON(), {
    value: { type: "length", value: 100, unit: "px" },
    source: h.declaration("max-width", "100px").toJSON(),
  });
});

test("#computed() resolves `max-width: 5em`", (t) => {
  const element = <div style={{ maxWidth: "5em" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("max-width").toJSON(), {
    value: { type: "length", value: 80, unit: "px" },
    source: h.declaration("max-width", "5em").toJSON(),
  });
});

test("#computed() preserves `max-width: 50%`", (t) => {
  const element = <div style={{ maxWidth: "50%" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("max-width").toJSON(), {
    value: { type: "percentage", value: 0.5 },
    source: h.declaration("max-width", "50%").toJSON(),
  });
});

test("#computed() preserves `max-width: none`", (t) => {
  const element = <div style={{ maxWidth: "none" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("max-width").toJSON(), {
    value: { type: "keyword", value: "none" },
    source: h.declaration("max-width", "none").toJSON(),
  });
});

test("#computed() preserves `max-width: max-content`", (t) => {
  const element = <div style={{ maxWidth: "max-content" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("max-width").toJSON(), {
    value: { type: "keyword", value: "max-content" },
    source: h.declaration("max-width", "max-content").toJSON(),
  });
});
