import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Style } from "../../dist/index.js";

const device = Device.standard();

test("#computed parses positive integer", (t) => {
  const element = <div style={{ zIndex: "12" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("z-index").toJSON(), {
    value: { type: "integer", value: 12 },
    source: h.declaration("z-index", "12").toJSON(),
  });
});

test("#computed parses positive integer with sign", (t) => {
  const element = <div style={{ zIndex: "+123" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("z-index").toJSON(), {
    value: { type: "integer", value: 123 },
    source: h.declaration("z-index", "+123").toJSON(),
  });
});

test("#computed parses negative integer", (t) => {
  const element = <div style={{ zIndex: "-456" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("z-index").toJSON(), {
    value: { type: "integer", value: -456 },
    source: h.declaration("z-index", "-456").toJSON(),
  });
});

test("#computed parses 0", (t) => {
  const element = <div style={{ zIndex: "0" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("z-index").toJSON(), {
    value: { type: "integer", value: 0 },
    source: h.declaration("z-index", "0").toJSON(),
  });
});

test("#computed parses -0", (t) => {
  const element = <div style={{ zIndex: "-0" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("z-index").toJSON(), {
    value: { type: "integer", value: 0 },
    source: h.declaration("z-index", "-0").toJSON(),
  });
});

test("#computed parses +0", (t) => {
  const element = <div style={{ zIndex: "+0" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("z-index").toJSON(), {
    value: { type: "integer", value: 0 },
    source: h.declaration("z-index", "+0").toJSON(),
  });
});

test("#computed does not parse number with decimal point", (t) => {
  const element = <div style={{ zIndex: "12.0" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("z-index").toJSON(), {
    value: { type: "keyword", value: "auto" },
    source: null,
  });
});

test("#computed does not parse integer with multiple signs", (t) => {
  const element = <div style={{ zIndex: "+---12" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("z-index").toJSON(), {
    value: { type: "keyword", value: "auto" },
    source: null,
  });
});

test("#computed does not parse letters", (t) => {
  const element = <div style={{ zIndex: "ten" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("z-index").toJSON(), {
    value: { type: "keyword", value: "auto" },
    source: null,
  });
});

test("#computed does not parse special characters", (t) => {
  const element = <div style={{ zIndex: "_5" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("z-index").toJSON(), {
    value: { type: "keyword", value: "auto" },
    source: null,
  });
});

test("#computed does not parse escaped unicode characters", (t) => {
  const element = <div style={{ zIndex: "\\35" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("z-index").toJSON(), {
    value: { type: "keyword", value: "auto" },
    source: null,
  });
});

test("#computed does not parse non-arabic numerals", (t) => {
  const element = <div style={{ zIndex: "\\4E94" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("z-index").toJSON(), {
    value: { type: "keyword", value: "auto" },
    source: null,
  });
});

test("#computed does not parse scientific notation", (t) => {
  const element = <div style={{ zIndex: "3e4" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("z-index").toJSON(), {
    value: { type: "keyword", value: "auto" },
    source: null,
  });
});

test("#computed resolves to initial value `auto`", (t) => {
  const element = <div />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("z-index").toJSON(), {
    value: { type: "keyword", value: "auto" },
    source: null,
  });
});
