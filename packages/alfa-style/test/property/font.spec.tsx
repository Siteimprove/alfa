import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

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
