import { test } from "@siteimprove/alfa-test";

import { cascaded } from "../common";

test("#cascaded() parses `font: 16px sans-serif`", (t) => {
  const element = <div style={{ font: "16px sans-serif" }} />;

  t.deepEqual(cascaded(element, "font-size").value, {
    type: "length",
    value: 16,
    unit: "px",
  });

  t.deepEqual(cascaded(element, "font-family").value, {
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
  const element = <div style={{ font: "80% sans-serif" }} />;

  t.deepEqual(cascaded(element, "font-size").value, {
    type: "percentage",
    value: 0.8,
  });
});

test("#cascaded() correctly handles line-height and font-family stack", (t) => {
  const element = (
    <div style={{ font: "x-large/110% 'new century schoolbook', serif" }} />
  );

  t.deepEqual(cascaded(element, "font-size").value, {
    type: "keyword",
    value: "x-large",
  });

  t.deepEqual(cascaded(element, "line-height").value, {
    type: "percentage",
    value: 1.1,
  });

  t.deepEqual(cascaded(element, "font-family").value, {
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
    />
  );

  t.deepEqual(cascaded(element, "font-style").value, {
    type: "keyword",
    value: "oblique",
  });

  t.deepEqual(cascaded(element, "font-weight").value, {
    type: "number",
    value: 753,
  });

  t.deepEqual(cascaded(element, "font-stretch").value, {
    type: "keyword",
    value: "condensed",
  });

  t.deepEqual(cascaded(element, "font-size").value, {
    type: "length",
    value: 12,
    unit: "pt",
  });

  t.deepEqual(cascaded(element, "font-family").value, {
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
