import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test(`#cascaded() parses \`border-image-source: url("foo.png")\``, (t) => {
  const element = (
    <div
      style={{
        borderImageSource: `url("foo.png")`,
      }}
    />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-image-source").get().toJSON(), {
    value: {
      type: "list",
      values: [
        {
          type: "image",
          image: {
            type: "url",
            url: "foo.png",
          },
        },
      ],
      separator: ", ",
    },
    source: h.declaration("border-image-source", `url("foo.png")`).toJSON(),
  });
});
