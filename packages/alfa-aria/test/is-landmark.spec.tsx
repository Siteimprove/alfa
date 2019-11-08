import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { isLandmark } from "../src/is-landmark";

const device = Device.getDefaultDevice();

test("Returns true when an element is a landmark", t => {
  const banner = <div role="banner" />;
  t(isLandmark(banner, banner, device));
});

test("Returns false when an element is not a landmark", t => {
  const button = <div role="button" />;
  t(!isLandmark(button, button, device));
});

test("Does not consider abstract roles", t => {
  const landmark = <div role="landmark" />;
  t(!isLandmark(landmark, landmark, device));
});
