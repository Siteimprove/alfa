import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";
import { Style } from "../../src";

const device = Device.standard();

test("#cascaded() parses `background-size: cover`", (t) => {
  const element = <div style={{ backgroundSize: `cover` }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("background-size").get().toJSON(), {
    value: {
      type: "list",
      values: [
        {
          type: "keyword",
          value: "cover",
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background-size", "cover").toJSON(),
  });
});
