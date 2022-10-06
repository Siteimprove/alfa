import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Serializable } from "@siteimprove/alfa-json";

import * as Slice from "../../src/property/border-image-slice";

import { cascaded } from "../common";

function slice(
  top: number,
  right?: number,
  bottom?: number,
  left?: number
): Serializable.ToJSON<Slice.Specified> {
  return {
    type: "tuple",
    values: [
      {
        type: "number",
        value: top,
      },
      {
        type: "number",
        value: right ?? top,
      },
      {
        type: "number",
        value: bottom ?? top,
      },
      {
        type: "number",
        value: left ?? right ?? top,
      },
    ],
  };
}

test(`#cascaded() parses \`border-image-slice: 1\``, (t) => {
  const element = (
    <div
      style={{
        borderImageSlice: "1",
      }}
    />
  );

  t.deepEqual(cascaded(element, "border-image-slice"), {
    value: slice(1),
    source: h.declaration("border-image-slice", "1").toJSON(),
  });
});

test(`#cascaded() parses \`border-image-slice: 1 2\``, (t) => {
  const element = (
    <div
      style={{
        borderImageSlice: "1 2",
      }}
    />
  );

  t.deepEqual(cascaded(element, "border-image-slice"), {
    value: slice(1, 2),
    source: h.declaration("border-image-slice", "1 2").toJSON(),
  });
});

test(`#cascaded() parses \`border-image-slice: 1 2 3\``, (t) => {
  const element = (
    <div
      style={{
        borderImageSlice: "1 2 3",
      }}
    />
  );

  t.deepEqual(cascaded(element, "border-image-slice"), {
    value: slice(1, 2, 3),
    source: h.declaration("border-image-slice", "1 2 3").toJSON(),
  });
});

test(`#cascaded() parses \`border-image-slice: 1 2 3 4\``, (t) => {
  const element = (
    <div
      style={{
        borderImageSlice: "1 2 3 4",
      }}
    />
  );

  t.deepEqual(cascaded(element, "border-image-slice"), {
    value: slice(1, 2, 3, 4),
    source: h.declaration("border-image-slice", "1 2 3 4").toJSON(),
  });
});

test(`#cascaded() parses \`border-image-slice: 1 2 3 4 fill\``, (t) => {
  const element = (
    <div
      style={{
        borderImageSlice: "1 2 3 4 fill",
      }}
    />
  );

  t.deepEqual(cascaded(element, "border-image-slice"), {
    value: {
      type: "tuple",
      values: [
        {
          type: "number",
          value: 1,
        },
        {
          type: "number",
          value: 2,
        },
        {
          type: "number",
          value: 3,
        },
        {
          type: "number",
          value: 4,
        },
        {
          type: "keyword",
          value: "fill",
        },
      ],
    },
    source: h.declaration("border-image-slice", "1 2 3 4 fill").toJSON(),
  });
});
