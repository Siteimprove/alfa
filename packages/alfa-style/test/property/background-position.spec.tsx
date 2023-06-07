import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { cascaded } from "../common";

test("#cascaded() parses `background-position: left`", (t) => {
  const element = <div style={{ backgroundPosition: `left` }} />;

  t.deepEqual(cascaded(element, "background-position-x"), {
    value: {
      type: "list",
      values: [
        {
          type: "side",
          side: {
            type: "keyword",
            value: "left",
          },
          offset: null,
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background-position", "left").toJSON(),
  });

  t.deepEqual(cascaded(element, "background-position-y"), {
    value: {
      type: "list",
      values: [
        {
          type: "keyword",
          value: "center",
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background-position", "left").toJSON(),
  });
});

test("#cascaded() parses `background-position: top`", (t) => {
  const element = <div style={{ backgroundPosition: `top` }} />;

  t.deepEqual(cascaded(element, "background-position-y"), {
    value: {
      type: "list",
      values: [
        {
          type: "side",
          side: {
            type: "keyword",
            value: "top",
          },
          offset: null,
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background-position", "top").toJSON(),
  });

  t.deepEqual(cascaded(element, "background-position-x"), {
    value: {
      type: "list",
      values: [
        {
          type: "keyword",
          value: "center",
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background-position", "top").toJSON(),
  });
});

test("#cascaded() parses `background-position-x: left`", (t) => {
  const element = <div style={{ backgroundPositionX: `left` }} />;

  t.deepEqual(cascaded(element, "background-position-x"), {
    value: {
      type: "list",
      values: [
        {
          type: "side",
          side: {
            type: "keyword",
            value: "left",
          },
          offset: null,
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background-position-x", "left").toJSON(),
  });
});

test("#cascaded() parses `background-position-y: top`", (t) => {
  const element = <div style={{ backgroundPositionY: `top` }} />;

  t.deepEqual(cascaded(element, "background-position-y"), {
    value: {
      type: "list",
      values: [
        {
          type: "side",
          side: {
            type: "keyword",
            value: "top",
          },
          offset: null,
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background-position-y", "top").toJSON(),
  });
});
