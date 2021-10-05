import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test("#cascaded() parses `clip: auto`", (t) => {
  const element = <div style={{ clip: "auto" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("clip").get().toJSON(), {
    value: {
      type: "keyword",
      value: "auto",
    },
    source: h.declaration("clip", "auto").toJSON(),
  });
});

test("#cascaded() parses `clip: rect(1px, auto, 2em, auto)`", (t) => {
  const element = <div style={{ clip: "rect(1px, auto, 2em, auto)" }} />;

  const style = Style.from(element, device);

  const cascaded = style.cascaded("clip");

  t.deepEqual(cascaded.get().toJSON(), {
    value: {
      type: "shape",
      shape: {
        type: "basic-shape",
        kind: "rectangle",
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
      box: {
        type: "keyword",
        value: "border-box",
      },
    },
    source: h.declaration("clip", "rect(1px, auto, 2em, auto)").toJSON(),
  });
});

test("#computed() returns a shape for absolutely positioned an element", (t) => {
  const element = (
    <div style={{ clip: "rect(1px auto 2em auto)", position: "absolute" }} />
  );

  const style = Style.from(element, device);

  const computed = style.computed("clip");

  t.deepEqual(computed.toJSON(), {
    value: {
      type: "shape",
      shape: {
        type: "basic-shape",
        kind: "rectangle",
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
      box: {
        type: "keyword",
        value: "border-box",
      },
    },
    source: h.declaration("clip", "rect(1px auto 2em auto)").toJSON(),
  });
});

test("#computed() returns `auto` for a non-absolutely positioned element", (t) => {
  const element = <div style={{ clip: "rect(1px auto 2em auto)" }} />;

  const style = Style.from(element, device);

  const computed = style.computed("clip");

  t.deepEqual(computed.toJSON(), {
    value: {
      type: "keyword",
      value: "auto",
    },
    source: null,
  });
});

test("#cascaded() fails clip with wrong number of arguments", (t) => {
  const element = <div style={{ clip: "rect(1px auto 2em)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("clip").isNone(), true);
});

test("#cascaded() fails clip mixing comma and whitespace separation", (t) => {
  const element = <div style={{ clip: "rect(1px auto 2em, auto)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("clip").isNone(), true);
});

