import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";
import { Serializable } from "@siteimprove/alfa-json";

import { Style } from "../../src/style";

import * as Outset from "../../src/property/border-image-outset";

const device = Device.standard();

function outset(
  top: number,
  right?: number,
  bottom?: number,
  left?: number
): Serializable.ToJSON<Outset.Specified> {
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
    value: outset(1),
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
    value: outset(1, 2),
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
    value: outset(1, 2, 3),
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
    value: outset(1, 2, 3, 4),
    source: h.declaration("border-image-outset", "1px 2px 3px 4px").toJSON(),
  });
});
