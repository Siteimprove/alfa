import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test(`#cascaded() parses \`border-image-repeat: round\``, (t) => {
  const element = (
    <div
      style={{
        borderImageRepeat: "round",
      }}
    />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-image-repeat").get().toJSON(), {
    value: {
      type: "tuple",
      values: [
        {
          type: "keyword",
          value: "round",
        },
        {
          type: "keyword",
          value: "round",
        },
      ],
    },
    source: h.declaration("border-image-repeat", "round").toJSON(),
  });
});

test(`#cascaded() parses \`border-image-repeat: round space\``, (t) => {
  const element = (
    <div
      style={{
        borderImageRepeat: "round space",
      }}
    />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-image-repeat").get().toJSON(), {
    value: {
      type: "tuple",
      values: [
        {
          type: "keyword",
          value: "round",
        },
        {
          type: "keyword",
          value: "space",
        },
      ],
    },
    source: h.declaration("border-image-repeat", "round space").toJSON(),
  });
});
