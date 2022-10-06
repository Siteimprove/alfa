import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { cascaded } from "../common";

test("#cascaded() parses single keyword", (t) => {
  const element = <div style={{ cursor: "auto" }} />;

  t.deepEqual(cascaded(element, "cursor"), {
    value: {
      type: "tuple",
      values: [
        { type: "list", values: [], separator: "," },
        { type: "keyword", value: "auto" },
      ],
    },
    source: h.declaration("cursor", "auto").toJSON(),
  });
});

test("#cascaded() parses a URL with no coordinates", (t) => {
  const element = <div style={{ cursor: "url(cursor.png), default" }} />;

  t.deepEqual(cascaded(element, "cursor"), {
    value: {
      type: "tuple",
      values: [
        {
          type: "list",
          values: [
            {
              type: "url",
              url: "cursor.png",
            },
          ],
          separator: ",",
        },
        { type: "keyword", value: "default" },
      ],
    },
    source: h.declaration("cursor", "url(cursor.png), default").toJSON(),
  });
});

test("#cascaded() parses a URL with coordinates", (t) => {
  const element = <div style={{ cursor: "url(cursor.png) 2 4, pointer" }} />;

  t.deepEqual(cascaded(element, "cursor"), {
    value: {
      type: "tuple",
      values: [
        {
          type: "list",
          values: [
            {
              type: "tuple",
              values: [
                {
                  type: "url",
                  url: "cursor.png",
                },
                { type: "number", value: 2 },
                { type: "number", value: 4 },
              ],
            },
          ],
          separator: ",",
        },
        { type: "keyword", value: "pointer" },
      ],
    },
    source: h.declaration("cursor", "url(cursor.png) 2 4, pointer").toJSON(),
  });
});

test("#cascaded() parses a long list", (t) => {
  const element = (
    <div
      style={{
        cursor:
          "url(cursor_1.svg) 4 5, url(cursor_2.svg), url(cursor_3.cur) 5 5, progress",
      }}
    />
  );

  t.deepEqual(cascaded(element, "cursor"), {
    value: {
      type: "tuple",
      values: [
        {
          type: "list",
          values: [
            {
              type: "tuple",
              values: [
                {
                  type: "url",
                  url: "cursor_1.svg",
                },
                { type: "number", value: 4 },
                { type: "number", value: 5 },
              ],
            },
            {
              type: "url",
              url: "cursor_2.svg",
            },
            {
              type: "tuple",
              values: [
                {
                  type: "url",
                  url: "cursor_3.cur",
                },
                { type: "number", value: 5 },
                { type: "number", value: 5 },
              ],
            },
          ],
          separator: ",",
        },
        { type: "keyword", value: "progress" },
      ],
    },
    source: h
      .declaration(
        "cursor",
        "url(cursor_1.svg) 4 5, url(cursor_2.svg), url(cursor_3.cur) 5 5, progress"
      )
      .toJSON(),
  });
});
