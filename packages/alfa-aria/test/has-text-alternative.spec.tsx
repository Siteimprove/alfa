import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { hasTextAlternative } from "../src/has-text-alternative";

const device = getDefaultDevice();

test("Returns true, if there is a text alternative", t => {
  const button = <button>Button</button>;
  t(hasTextAlternative(button, button, device));
});

test("Returns false, if there is no text alternative", t => {
  const img = <img src="foo.png" />;
  t(!hasTextAlternative(img, img, device));
});
