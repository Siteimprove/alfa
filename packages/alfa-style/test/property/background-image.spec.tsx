import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test(`#cascaded() parses \`background-image: url("foo.png")\``, (t) => {
  const element = <div style={{ backgroundImage: `url("foo.png")` }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("background-image").get().toJSON(), {
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
    source: h.declaration("background-image", `url("foo.png")`).toJSON(),
  });
});
