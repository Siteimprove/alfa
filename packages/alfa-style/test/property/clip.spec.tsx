import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

test("#cascaded() parses `clip: auto`", (t) => {
  const element = <div style={{ clip: "auto" }}></div>;

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("clip").get().toJSON(), {
    value: {
      type: "keyword",
      value: "auto",
    },
    source: h.declaration("clip", "auto").toJSON(),
  });
});

test("#cascaded() parses `clip: rect(1px, auto, 2em, auto)`", (t) => {
  const element = <div style={{ clip: "rect(1px, auto, 2em, auto)" }}></div>;

  const style = Style.from(element, Device.standard());

  const cascaded = style.cascaded("clip");

  // console.log(cascaded.toJSON());

  t.deepEqual(cascaded.get().toJSON(), {
    value: {
      type: "shape",
      format: "rectangle",
      bottom: {
        type: "length",
        unit: "em",
        value: 2,
      },
      left: {
        type: "keyword",
        value: "auto",
      },
      right: {
        type: "keyword",
        value: "auto",
      },
      top: {
        type: "length",
        unit: "px",
        value: 1,
      },
    },
    source: h.declaration("clip", "rect(1px, auto, 2em, auto)").toJSON(),
  });
});

test("#cascaded() parses `clip: rect(1px auto 2em auto)`", (t) => {
  const element = <div style={{ clip: "rect(1px auto 2em auto)" }}></div>;

  const style = Style.from(element, Device.standard());

  const cascaded = style.cascaded("clip");

  t.deepEqual(cascaded.get().toJSON(), {
    value: {
      type: "shape",
      format: "rectangle",
      bottom: {
        type: "length",
        unit: "em",
        value: 2,
      },
      left: {
        type: "keyword",
        value: "auto",
      },
      right: {
        type: "keyword",
        value: "auto",
      },
      top: {
        type: "length",
        unit: "px",
        value: 1,
      },
    },
    source: h.declaration("clip", "rect(1px auto 2em auto)").toJSON(),
  });
});

test("#cascaded() fails clip with wrong number of arguments", (t) => {
  const element = <div style={{ clip: "rect(1px auto 2em)" }}></div>;

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("clip").isNone(), true);
});

test("#cascaded() fails clip mixing comma and whitespace separation", (t) => {
  const element = <div style={{ clip: "rect(1px auto 2em, auto)" }}></div>;

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("clip").isNone(), true);
});
