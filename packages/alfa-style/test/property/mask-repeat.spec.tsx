import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { computed } from "../common.js";

test("initial value is repeat", (t) => {
  t.deepEqual(computed(<div></div>, "mask-repeat"), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "tuple",
          values: [
            { type: "keyword", value: "repeat" },
            { type: "keyword", value: "repeat" },
          ],
        },
      ],
    },
    source: null,
  });
});

test("#computed parses single keywords", (t) => {
  t.deepEqual(
    computed(<div style={{ maskRepeat: "repeat-x" }}></div>, "mask-repeat"),
    {
      value: {
        type: "list",
        separator: ", ",
        values: [
          {
            type: "tuple",
            values: [
              { type: "keyword", value: "repeat" },
              { type: "keyword", value: "no-repeat" },
            ],
          },
        ],
      },
      source: h.declaration("mask-repeat", "repeat-x").toJSON(),
    },
  );

  t.deepEqual(
    computed(<div style={{ maskRepeat: "repeat-y" }}></div>, "mask-repeat"),
    {
      value: {
        type: "list",
        separator: ", ",
        values: [
          {
            type: "tuple",
            values: [
              { type: "keyword", value: "no-repeat" },
              { type: "keyword", value: "repeat" },
            ],
          },
        ],
      },
      source: h.declaration("mask-repeat", "repeat-y").toJSON(),
    },
  );

  for (const kw of ["repeat", "space", "round", "no-repeat"] as const) {
    t.deepEqual(
      computed(<div style={{ maskRepeat: kw }}></div>, "mask-repeat"),
      {
        value: {
          type: "list",
          separator: ", ",
          values: [
            {
              type: "tuple",
              values: [
                { type: "keyword", value: kw },
                { type: "keyword", value: kw },
              ],
            },
          ],
        },
        source: h.declaration("mask-repeat", kw).toJSON(),
      },
    );
  }
});

test("#computed parses at most two space separated values", (t) => {
  t.deepEqual(
    computed(<div style={{ maskRepeat: "repeat space" }}></div>, "mask-repeat"),
    {
      value: {
        type: "list",
        separator: ", ",
        values: [
          {
            type: "tuple",
            values: [
              { type: "keyword", value: "repeat" },
              { type: "keyword", value: "space" },
            ],
          },
        ],
      },
      source: h.declaration("mask-repeat", "repeat space").toJSON(),
    },
  );

  t.deepEqual(
    computed(
      <div style={{ maskRepeat: "repeat space round" }}></div>,
      "mask-repeat",
    ),
    {
      value: {
        type: "list",
        separator: ", ",
        values: [
          {
            type: "tuple",
            values: [
              { type: "keyword", value: "repeat" },
              { type: "keyword", value: "repeat" },
            ],
          },
        ],
      },
      source: null,
    },
  );
});
