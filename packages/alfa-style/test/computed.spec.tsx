import {Device} from "@siteimprove/alfa-device";
import {h, jsx} from "@siteimprove/alfa-dom";
import {test} from "@siteimprove/alfa-test";
import {Style} from "../src";

test("#cascaded() returns the cascaded value of a property", (t) => {
  const element = <div id="target" style={{ color: "red", "--foo": "lime", backgroundColor: "var(--foo, cyan)" }}></div>;

  console.log("-----   Creating style  -----");
  const style = Style.from(element, Device.standard());

  console.log("-----   Triggering substitution  -----");
  const bgComputed = style.computed("background-color").toJSON();
  console.log("-----   Computed BG color  -----");
  console.log(bgComputed);

  t.deepEqual(style.cascaded("color").get().toJSON(), {
    value: {
      type: "color",
      format: "named",
      color: "red",
    },
    source: h.declaration("color", "red").toJSON(),
  });
});
