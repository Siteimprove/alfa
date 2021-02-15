import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test("#cascaded() parses `font-size: calc(1em + 2px)`", (t) => {
  const element = <div style={{ fontSize: "calc(1em + 2px)" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("font-size").get().toJSON(), {
    value: {
      type: "calculation",
      expression: {
        type: "sum",
        operands: [
          {
            type: "value",
            value: {
              type: "length",
              value: 1,
              unit: "em",
            },
          },
          {
            type: "value",
            value: {
              type: "length",
              value: 2,
              unit: "px",
            },
          },
        ],
      },
    },
    source: h.declaration("font-size", "calc(1em + 2px)").toJSON(),
  });
});

test("#computed() resolves `font-size: calc(1em + 2px)`", (t) => {
  const element = <div style={{ fontSize: "calc(1em + 2px)" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("font-size").toJSON(), {
    value: {
      type: "length",
      value: 18,
      unit: "px",
    },
    source: h.declaration("font-size", "calc(1em + 2px)").toJSON(),
  });
});

test("#cascaded() parses `font-size: calc(1em + 2%)`", (t) => {
  const element = <div style={{ fontSize: "calc(1em + 2%)" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("font-size").get().toJSON(), {
    value: {
      type: "calculation",
      expression: {
        type: "sum",
        operands: [
          {
            type: "value",
            value: {
              type: "length",
              value: 1,
              unit: "em",
            },
          },
          {
            type: "value",
            value: {
              type: "percentage",
              value: 0.02,
            },
          },
        ],
      },
    },
    source: h.declaration("font-size", "calc(1em + 2%)").toJSON(),
  });
});

test("#computed() resolves `font-size: calc(1em + 2%)`", (t) => {
  const element = <div style={{ fontSize: "calc(1em + 2%)" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("font-size").toJSON(), {
    value: {
      type: "length",
      value: 16.32,
      unit: "px",
    },
    source: h.declaration("font-size", "calc(1em + 2%)").toJSON(),
  });
});

test("#cascaded() ignores `font-size: calc(20deg)`", (t) => {
  const element = <div style={{ fontSize: "calc(20deg)" }}></div>;

  const style = Style.from(element, device);

  t.equal(style.cascaded("font-size").isNone(), true);
});

test("#cascaded() parses `font: 16px sans-serif`", (t) => {
  const element = <div style={{ font: "16px sans-serif" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("font-size").get().value.toJSON(), {
    type: "length",
    value: 16,
    unit: "px",
  });

  t.deepEqual(style.cascaded("font-family").get().toJSON().value, {
    type: "list",
    separator: ", ",
    values: [
      {
        type: "keyword",
        value: "sans-serif",
      },
    ],
  });
});

test("#cascaded() assigns percentage to font-size, not font-stretch", (t) => {
  const element = <div style={{ font: "80% sans-serif" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("font-size").get().value.toJSON(), {
    type: "percentage",
    value: 0.8,
  });
});

test("#cascaded() correctly handles line-height and font-family stack", (t) => {
  const element = (
    <div style={{ font: "x-large/110% 'new century schoolbook', serif" }}></div>
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("font-size").get().value.toJSON(), {
    type: "keyword",
    value: "x-large",
  });

  t.deepEqual(style.cascaded("line-height").get().value.toJSON(), {
    type: "percentage",
    value: 1.1,
  });

  t.deepEqual(style.cascaded("font-family").get().toJSON().value, {
    type: "list",
    separator: ", ",
    values: [
      {
        type: "string",
        value: "new century schoolbook",
      },
      { type: "keyword", value: "serif" },
    ],
  });
});

test("#cascaded parses `condensed oblique753 12pt 'Helvetica Neue', serif`", (t) => {
  const element = (
    <div
      style={{
        font: "condensed oblique 753 12pt 'Helvetica Neue', serif",
      }}
    ></div>
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("font-style").get().value.toJSON(), {
    type: "keyword",
    value: "oblique",
  });

  t.deepEqual(style.cascaded("font-weight").get().value.toJSON(), {
    type: "number",
    value: 753,
  });

  t.deepEqual(style.cascaded("font-stretch").get().value.toJSON(), {
    type: "keyword",
    value: "condensed",
  });

  t.deepEqual(style.cascaded("font-size").get().value.toJSON(), {
    type: "length",
    value: 12,
    unit: "pt",
  });

  t.deepEqual(style.cascaded("font-family").get().toJSON().value, {
    type: "list",
    separator: ", ",
    values: [
      {
        type: "string",
        value: "Helvetica Neue",
      },
      {
        type: "keyword",
        value: "serif",
      },
    ],
  });
});
