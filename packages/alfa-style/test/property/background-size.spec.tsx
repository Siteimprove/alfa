import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";
import { cascaded } from "../common";

test("#cascaded() parses `background-size: cover`", (t) => {
  const element = <div style={{ backgroundSize: `cover` }} />;

  t.deepEqual(cascaded(element, "background-size"), {
    value: {
      type: "list",
      values: [
        {
          type: "keyword",
          value: "cover",
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background-size", "cover").toJSON(),
  });
});

test("#cascaded() parses `background-size: 10px`", (t) => {
  const element = <div style={{ backgroundSize: `10px` }} />;

  t.deepEqual(cascaded(element, "background-size"), {
    value: {
      type: "list",
      values: [
        {
          type: "tuple",
          values: [
            {
              type: "length",
              value: 10,
              unit: "px",
            },
            {
              type: "keyword",
              value: "auto",
            },
          ],
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background-size", "10px").toJSON(),
  });
});

test("#cascaded() parses `background-size: 10%`", (t) => {
  const element = <div style={{ backgroundSize: `10%` }} />;

  t.deepEqual(cascaded(element, "background-size"), {
    value: {
      type: "list",
      values: [
        {
          type: "tuple",
          values: [
            {
              type: "percentage",
              value: 0.1,
            },
            {
              type: "keyword",
              value: "auto",
            },
          ],
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background-size", "10%").toJSON(),
  });
});

test("#cascaded() parses `background-size: 10px 20px`", (t) => {
  const element = <div style={{ backgroundSize: `10px 20px` }} />;

  t.deepEqual(cascaded(element, "background-size"), {
    value: {
      type: "list",
      values: [
        {
          type: "tuple",
          values: [
            {
              type: "length",
              value: 10,
              unit: "px",
            },
            {
              type: "length",
              value: 20,
              unit: "px",
            },
          ],
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background-size", "10px 20px").toJSON(),
  });
});

test("#cascaded() parses `background-size: 10px, 20px`", (t) => {
  const element = <div style={{ backgroundSize: `10px, 20px` }} />;

  t.deepEqual(cascaded(element, "background-size"), {
    value: {
      type: "list",
      values: [
        {
          type: "tuple",
          values: [
            {
              type: "length",
              value: 10,
              unit: "px",
            },
            {
              type: "keyword",
              value: "auto",
            },
          ],
        },
        {
          type: "tuple",
          values: [
            {
              type: "length",
              value: 20,
              unit: "px",
            },
            {
              type: "keyword",
              value: "auto",
            },
          ],
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background-size", "10px, 20px").toJSON(),
  });
});
