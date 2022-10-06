import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { cascaded } from "../common";

test(`#cascaded() parses \`border-image-source: url("foo.png")\``, (t) => {
  const element = (
    <div
      style={{
        borderImageSource: `url("foo.png")`,
      }}
    />
  );

  t.deepEqual(cascaded(element, "border-image-source"), {
    value: {
      type: "image",
      image: {
        type: "url",
        url: "foo.png",
      },
    },
    source: h.declaration("border-image-source", `url("foo.png")`).toJSON(),
  });
});
