import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test(`#cascaded() parses \`border-image-slice: 1\``, (t) => {
  const element = (
    <div
      style={{
        borderImageSlice: "1",
      }}
    />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-image-slice").get().toJSON(), {
    value: {
      type: "tuple",
      values: [
        {
          type: "number",
          value: 1,
        },
        {
          type: "number",
          value: 1,
        },
        {
          type: "number",
          value: 1,
        },
        {
          type: "number",
          value: 1,
        },
      ],
    },
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

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-image-slice").get().toJSON(), {
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
          value: 1,
        },
        {
          type: "number",
          value: 2,
        },
      ],
    },
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

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-image-slice").get().toJSON(), {
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
          value: 2,
        },
      ],
    },
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

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-image-slice").get().toJSON(), {
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
      ],
    },
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

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-image-slice").get().toJSON(), {
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
