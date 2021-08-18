import { Device } from "@siteimprove/alfa-device";
import { Declaration } from "@siteimprove/alfa-dom";
import { Style } from "@siteimprove/alfa-style";
import { test } from "@siteimprove/alfa-test";
import { Serialise } from "../../src/sia-r62/serialise";

const { background } = Serialise;
const device = Device.standard();

function mkStyle(properties: Array<[string, string]>): Style {
  return Style.of(
    properties.map(([name, value]) => Declaration.of(name, value)),
    device
  );
}

test(`background() serialise a simple background color`, (t) => {
  const style = mkStyle([["background-color", "red"]]);

  t.deepEqual(background(style), "rgb(100% 0% 0%)");
});
