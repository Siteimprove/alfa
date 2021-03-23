import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test(`#cascaded() parses \`border-image-outset: 1px\``, (t) => {
  const element = (
    <div
      style={{
        borderImageOutset: "1px",
      }}
    />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-image-outset").get().toJSON(), {
    value: {
      type: "tuple",
      values: [
        {
          type: "length",
          value: 1,
          unit: "px",
        },
        {
          type: "length",
          value: 1,
          unit: "px",
        },
        {
          type: "length",
          value: 1,
          unit: "px",
        },
        {
          type: "length",
          value: 1,
          unit: "px",
        },
      ],
    },
    source: h.declaration("border-image-outset", "1px").toJSON(),
  });
});

test(`#cascaded() parses \`border-image-outset: 1px 2px\``, (t) => {
  const element = (
    <div
      style={{
        borderImageOutset: "1px 2px",
      }}
    />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-image-outset").get().toJSON(), {
    value: {
      type: "tuple",
      values: [
        {
          type: "length",
          value: 1,
          unit: "px",
        },
        {
          type: "length",
          value: 2,
          unit: "px",
        },
        {
          type: "length",
          value: 1,
          unit: "px",
        },
        {
          type: "length",
          value: 2,
          unit: "px",
        },
      ],
    },
    source: h.declaration("border-image-outset", "1px 2px").toJSON(),
  });
});

test(`#cascaded() parses \`border-image-outset: 1px 2px 3px\``, (t) => {
  const element = (
    <div
      style={{
        borderImageOutset: "1px 2px 3px",
      }}
    />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-image-outset").get().toJSON(), {
    value: {
      type: "tuple",
      values: [
        {
          type: "length",
          value: 1,
          unit: "px",
        },
        {
          type: "length",
          value: 2,
          unit: "px",
        },
        {
          type: "length",
          value: 3,
          unit: "px",
        },
        {
          type: "length",
          value: 2,
          unit: "px",
        },
      ],
    },
    source: h.declaration("border-image-outset", "1px 2px 3px").toJSON(),
  });
});

test(`#cascaded() parses \`border-image-outset: 1px 2px 3px 4px\``, (t) => {
  const element = (
    <div
      style={{
        borderImageOutset: "1px 2px 3px 4px",
      }}
    />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-image-outset").get().toJSON(), {
    value: {
      type: "tuple",
      values: [
        {
          type: "length",
          value: 1,
          unit: "px",
        },
        {
          type: "length",
          value: 2,
          unit: "px",
        },
        {
          type: "length",
          value: 3,
          unit: "px",
        },
        {
          type: "length",
          value: 4,
          unit: "px",
        },
      ],
    },
    source: h.declaration("border-image-outset", "1px 2px 3px 4px").toJSON(),
  });
});
