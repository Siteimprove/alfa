import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/dist/h";

import { cascaded } from "../common";

test("#cascaded() parses `box-shadow: none`", (t) => {
  const element = <div style={{ boxShadow: "none" }} />;

  t.deepEqual(cascaded(element, "box-shadow"), {
    value: { type: "keyword", value: "none" },
    source: h.declaration("box-shadow", "none").toJSON(),
  });
});

test("#cascaded() parses `box-shadow: 1px 2px`", (t) => {
  const element = <div style={{ boxShadow: "1px 2px" }} />;

  t.deepEqual(cascaded(element, "box-shadow"), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "shadow",
          horizontal: { type: "length", unit: "px", value: 1 },
          vertical: { type: "length", unit: "px", value: 2 },
          blur: { type: "length", unit: "px", value: 0 },
          spread: { type: "length", unit: "px", value: 0 },
          color: { type: "keyword", value: "currentcolor" },
          isInset: false,
        },
      ],
    },
    source: h.declaration("box-shadow", "1px 2px").toJSON(),
  });
});

test("#cascaded() parses `box-shadow: 1px 2px 3px`", (t) => {
  const element = <div style={{ boxShadow: "1px 2px 3px" }} />;

  t.deepEqual(cascaded(element, "box-shadow"), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "shadow",
          horizontal: { type: "length", unit: "px", value: 1 },
          vertical: { type: "length", unit: "px", value: 2 },
          blur: { type: "length", unit: "px", value: 3 },
          spread: { type: "length", unit: "px", value: 0 },
          color: { type: "keyword", value: "currentcolor" },
          isInset: false,
        },
      ],
    },
    source: h.declaration("box-shadow", "1px 2px 3px").toJSON(),
  });
});

test("#cascaded() parses `box-shadow: 1px 2px 3px 4px`", (t) => {
  const element = <div style={{ boxShadow: "1px 2px 3px 4px" }} />;

  t.deepEqual(cascaded(element, "box-shadow"), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "shadow",
          horizontal: { type: "length", unit: "px", value: 1 },
          vertical: { type: "length", unit: "px", value: 2 },
          blur: { type: "length", unit: "px", value: 3 },
          spread: { type: "length", unit: "px", value: 4 },
          color: { type: "keyword", value: "currentcolor" },
          isInset: false,
        },
      ],
    },
    source: h.declaration("box-shadow", "1px 2px 3px 4px").toJSON(),
  });
});

test("#cascaded() parses `box-shadow: 1px 2px inset`", (t) => {
  const element = <div style={{ boxShadow: "1px 2px inset" }} />;

  t.deepEqual(cascaded(element, "box-shadow"), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "shadow",
          horizontal: { type: "length", unit: "px", value: 1 },
          vertical: { type: "length", unit: "px", value: 2 },
          blur: { type: "length", unit: "px", value: 0 },
          spread: { type: "length", unit: "px", value: 0 },
          color: { type: "keyword", value: "currentcolor" },
          isInset: true,
        },
      ],
    },
    source: h.declaration("box-shadow", "1px 2px inset").toJSON(),
  });
});

test("#cascaded() parses `box-shadow: inset 1px 2px`", (t) => {
  const element = <div style={{ boxShadow: "inset 1px 2px" }} />;

  t.deepEqual(cascaded(element, "box-shadow"), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "shadow",
          horizontal: { type: "length", unit: "px", value: 1 },
          vertical: { type: "length", unit: "px", value: 2 },
          blur: { type: "length", unit: "px", value: 0 },
          spread: { type: "length", unit: "px", value: 0 },
          color: { type: "keyword", value: "currentcolor" },
          isInset: true,
        },
      ],
    },
    source: h.declaration("box-shadow", "inset 1px 2px").toJSON(),
  });
});

test("#cascaded() parses `box-shadow: 1px 2px red`", (t) => {
  const element = <div style={{ boxShadow: "1px 2px red" }} />;

  t.deepEqual(cascaded(element, "box-shadow"), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "shadow",
          horizontal: { type: "length", unit: "px", value: 1 },
          vertical: { type: "length", unit: "px", value: 2 },
          blur: { type: "length", unit: "px", value: 0 },
          spread: { type: "length", unit: "px", value: 0 },
          color: { type: "color", format: "named", color: "red" },
          isInset: false,
        },
      ],
    },
    source: h.declaration("box-shadow", "1px 2px red").toJSON(),
  });
});

test("#cascaded() parses `box-shadow: red 1px 2px`", (t) => {
  const element = <div style={{ boxShadow: "red 1px 2px" }} />;

  t.deepEqual(cascaded(element, "box-shadow"), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "shadow",
          horizontal: { type: "length", unit: "px", value: 1 },
          vertical: { type: "length", unit: "px", value: 2 },
          blur: { type: "length", unit: "px", value: 0 },
          spread: { type: "length", unit: "px", value: 0 },
          color: { type: "color", format: "named", color: "red" },
          isInset: false,
        },
      ],
    },
    source: h.declaration("box-shadow", "red 1px 2px").toJSON(),
  });
});

test("#cascaded() parses `box-shadow: red 1px 2px inset`", (t) => {
  const element = <div style={{ boxShadow: "red 1px 2px inset" }} />;

  t.deepEqual(cascaded(element, "box-shadow"), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "shadow",
          horizontal: { type: "length", unit: "px", value: 1 },
          vertical: { type: "length", unit: "px", value: 2 },
          blur: { type: "length", unit: "px", value: 0 },
          spread: { type: "length", unit: "px", value: 0 },
          color: { type: "color", format: "named", color: "red" },
          isInset: true,
        },
      ],
    },
    source: h.declaration("box-shadow", "red 1px 2px inset").toJSON(),
  });
});
