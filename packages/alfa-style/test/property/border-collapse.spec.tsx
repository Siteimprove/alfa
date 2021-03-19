import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test("#cascaded() parses `border-collapse: separate`", (t) => {
  const element = <table style={{ borderCollapse: "separate" }}></table>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("border-collapse").get().toJSON(), {
    value: {
      type: "keyword",
      value: "separate",
    },
    source: h.declaration("border-collapse", "separate").toJSON(),
  });
});
