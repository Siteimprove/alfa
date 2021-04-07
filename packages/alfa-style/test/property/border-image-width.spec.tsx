import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";
import { Serializable } from "@siteimprove/alfa-json";

import * as Width from "../../src/property/border-image-width";

import { Style } from "../../src/style";

const device = Device.standard();

function width(
  top: number,
  right?: number,
  bottom?: number,
  left?: number
): Serializable.ToJSON<Width.Specified> {
  return {
    type: "tuple",
    values: [
      {
        type: "length",
        value: top,
        unit: "px",
      },
      {
        type: "length",
        value: right ?? top,
        unit: "px",
      },
      {
        type: "length",
        value: bottom ?? top,
        unit: "px",
      },
      {
        type: "length",
        value: left ?? right ?? top,
        unit: "px",
      },
    ],
  };
}

test(`#cascaded() parses \`border-image-width: 1px\``, (t) => {
  const element = (
    <div
      style={{
        borderImageWidth: "1px",
      }}
    />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-image-width").get().toJSON(), {
    value: width(1),
    source: h.declaration("border-image-width", "1px").toJSON(),
  });
});

test(`#cascaded() parses \`border-image-width: 1px 2px\``, (t) => {
  const element = (
    <div
      style={{
        borderImageWidth: "1px 2px",
      }}
    />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-image-width").get().toJSON(), {
    value: width(1, 2),
    source: h.declaration("border-image-width", "1px 2px").toJSON(),
  });
});

test(`#cascaded() parses \`border-image-width: 1px 2px 3px\``, (t) => {
  const element = (
    <div
      style={{
        borderImageWidth: "1px 2px 3px",
      }}
    />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-image-width").get().toJSON(), {
    value: width(1, 2, 3),
    source: h.declaration("border-image-width", "1px 2px 3px").toJSON(),
  });
});

test(`#cascaded() parses \`border-image-width: 1px 2px 3px 4px\``, (t) => {
  const element = (
    <div
      style={{
        borderImageWidth: "1px 2px 3px 4px",
      }}
    />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-image-width").get().toJSON(), {
    value: width(1, 2, 3, 4),
    source: h.declaration("border-image-width", "1px 2px 3px 4px").toJSON(),
  });
});
