import { Device } from "@siteimprove/alfa-device";
import { h, jsx } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";
import { Style } from "../src";

const lime = {
  type: "color",
  format: "rgb",
  red: {
    type: "percentage",
    value: 0,
  },
  green: {
    type: "percentage",
    value: 1,
  },
  blue: {
    type: "percentage",
    value: 0,
  },
  alpha: {
    type: "percentage",
    value: 1,
  },
};

const transparent = {
  type: "color",
  format: "rgb",
  red: {
    type: "percentage",
    value: 0,
  },
  green: {
    type: "percentage",
    value: 0,
  },
  blue: {
    type: "percentage",
    value: 0,
  },
  alpha: {
    type: "percentage",
    value: 0,
  },
};

test("#computed() substitute a custom property defined at the same time", (t) => {
  const element = (
    <div style={{ "--foo": "lime", backgroundColor: "var(--foo, cyan)" }}></div>
  );

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.computed("background-color").toJSON(), {
    value: lime,
    source: h.declaration("background-color", "var(--foo, cyan)").toJSON(),
  });
});

test("#computed() substitute an inherited custom property", (t) => {
  const element = <div style={{ backgroundColor: "var(--foo, cyan)" }}></div>;
  const parent = <div style={{ "--foo": "lime" }}>{element}</div>;

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.computed("background-color").toJSON(), {
    value: lime,
    source: h.declaration("background-color", "var(--foo, cyan)").toJSON(),
  });
});

test("#computed() uses fallback if a custom property does not exist", (t) => {
  const element = <div style={{ backgroundColor: "var(--foo, lime)" }}></div>;

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.computed("background-color").toJSON(), {
    value: lime,
    source: h.declaration("background-color", "var(--foo, lime)").toJSON(),
  });
});

test("#computed() use default value if property is invalid at computed-value time", (t) => {
  const elements = [
    <div style={{ backgroundColor: "var(--foo)" }}></div>, // no custom, no fallback
    <div
      style={{ "--foo": "invalid", backgroundColor: "var(--foo, cyan)" }}
    ></div>, // invalid custom (fallback is ignored)
    <div style={{ backgroundColor: "var(--foo, invalid)" }}></div>, // no custom, invalid fallback
  ];

  for (const element of elements) {
    const style = Style.from(element, Device.standard());

    t.deepEqual(style.computed("background-color").toJSON(), {
      value: transparent,
      source: null,
    });
  }
});
