import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { cascaded } from "../common";

test(`#cascaded() parses \`background-image: url("foo.png")\``, (t) => {
  const element = <div style={{ backgroundImage: `url("foo.png")` }} />;

  t.deepEqual(cascaded(element, "background-image"), {
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
