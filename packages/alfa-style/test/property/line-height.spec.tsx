import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test("#computed() resolves `line-height: calc(1em + 2px)`", (t) => {
  const element = <div style={{ lineHeight: "calc(1em + 2px)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("line-height").toJSON(), {
    value: {
      type: "length",
      value: 18,
      unit: "px",
    },
    source: h.declaration("line-height", "calc(1em + 2px)").toJSON(),
  });
});

test("#computed() resolves `line-height: calc(1 + 2)`", (t) => {
  const element = <div style={{ lineHeight: "calc(1 + 2)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("line-height").toJSON(), {
    value: {
      type: "number",
      value: 3,
    },
    source: h.declaration("line-height", "calc(1 + 2)").toJSON(),
  });
});

test("#computed() resolves percentages from the element's \`font-size\`", (t) => {
  const target = (
    <div style={{ lineHeight: "150%", fontSize: "10px" }}>Hello</div>
  );

  <div style={{ fontSize: "20px" }}>{target}</div>;

  const style = Style.from(target, device);

  t.deepEqual(style.computed("line-height").toJSON(), {
    value: {
      type: "length",
      unit: "px",
      value: 15,
    },
    source: h.declaration("line-height", "150%").toJSON(),
  });
});
