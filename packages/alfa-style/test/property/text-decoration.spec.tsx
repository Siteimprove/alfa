import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { cascaded } from "../common";

test("#cascaded() parses `text-decoration: underline`", (t) => {
  const element = <div style={{ textDecoration: "underline" }} />;

  t.deepEqual(cascaded(element, "text-decoration-line"), {
    value: {
      type: "list",
      values: [
        {
          type: "keyword",
          value: "underline",
        },
      ],
      separator: " ",
    },
    source: h.declaration("text-decoration", "underline").toJSON(),
  });

  t.deepEqual(cascaded(element, "text-decoration-style"), {
    value: {
      type: "keyword",
      value: "initial",
    },
    source: h.declaration("text-decoration", "underline").toJSON(),
  });

  t.deepEqual(cascaded(element, "text-decoration-color"), {
    value: {
      type: "keyword",
      value: "initial",
    },
    source: h.declaration("text-decoration", "underline").toJSON(),
  });
});

test("#cascaded() parses `text-decoration: underline overline`", (t) => {
  const element = <div style={{ textDecoration: "underline overline" }} />;

  t.deepEqual(cascaded(element, "text-decoration-line"), {
    value: {
      type: "list",
      values: [
        {
          type: "keyword",
          value: "underline",
        },
        {
          type: "keyword",
          value: "overline",
        },
      ],
      separator: " ",
    },
    source: h.declaration("text-decoration", "underline overline").toJSON(),
  });
});

test("#cascaded() parses `text-decoration: underline solid`", (t) => {
  const element = <div style={{ textDecoration: "underline solid" }} />;

  t.deepEqual(cascaded(element, "text-decoration-line"), {
    value: {
      type: "list",
      values: [
        {
          type: "keyword",
          value: "underline",
        },
      ],
      separator: " ",
    },
    source: h.declaration("text-decoration", "underline solid").toJSON(),
  });

  t.deepEqual(cascaded(element, "text-decoration-style"), {
    value: {
      type: "keyword",
      value: "solid",
    },
    source: h.declaration("text-decoration", "underline solid").toJSON(),
  });
});

test("#cascaded() parses `text-decoration: underline red`", (t) => {
  const element = <div style={{ textDecoration: "underline red" }} />;

  t.deepEqual(cascaded(element, "text-decoration-line"), {
    value: {
      type: "list",
      values: [
        {
          type: "keyword",
          value: "underline",
        },
      ],
      separator: " ",
    },
    source: h.declaration("text-decoration", "underline red").toJSON(),
  });

  t.deepEqual(cascaded(element, "text-decoration-color"), {
    value: {
      type: "color",
      format: "named",
      color: "red",
    },
    source: h.declaration("text-decoration", "underline red").toJSON(),
  });
});

test("#cascaded() parses `text-decoration: underline solid red`", (t) => {
  const element = <div style={{ textDecoration: "underline solid red" }} />;

  t.deepEqual(cascaded(element, "text-decoration-line"), {
    value: {
      type: "list",
      values: [
        {
          type: "keyword",
          value: "underline",
        },
      ],
      separator: " ",
    },
    source: h.declaration("text-decoration", "underline solid red").toJSON(),
  });

  t.deepEqual(cascaded(element, "text-decoration-style"), {
    value: {
      type: "keyword",
      value: "solid",
    },
    source: h.declaration("text-decoration", "underline solid red").toJSON(),
  });

  t.deepEqual(cascaded(element, "text-decoration-color"), {
    value: {
      type: "color",
      format: "named",
      color: "red",
    },
    source: h.declaration("text-decoration", "underline solid red").toJSON(),
  });
});

test("#cascaded() parses `text-decoration: underline solid red 2px`", (t) => {
  const element = <div style={{ textDecoration: "underline solid red 2px" }} />;

  const declaration = h.declaration(
    "text-decoration",
    "underline solid red 2px"
  );

  t.deepEqual(cascaded(element, "text-decoration-line"), {
    value: {
      type: "list",
      values: [
        {
          type: "keyword",
          value: "underline",
        },
      ],
      separator: " ",
    },
    source: declaration.toJSON(),
  });

  t.deepEqual(cascaded(element, "text-decoration-style"), {
    value: {
      type: "keyword",
      value: "solid",
    },
    source: declaration.toJSON(),
  });

  t.deepEqual(cascaded(element, "text-decoration-color"), {
    value: {
      type: "color",
      format: "named",
      color: "red",
    },
    source: declaration.toJSON(),
  });

  t.deepEqual(cascaded(element, "text-decoration-thickness"), {
    value: {
      type: "length",
      value: 2,
      unit: "px",
    },
    source: declaration.toJSON(),
  });
});
