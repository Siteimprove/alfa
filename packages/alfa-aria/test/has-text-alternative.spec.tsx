import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import { hasTextAlternative } from "../src/has-text-alternative";

const device = getDefaultDevice();

test("Returns true if an element has a text alternative", t => {
  const button = <button>Button</button>;
  t(hasTextAlternative(button, button, device));
});

test("Returns false if an element has no text alternative", t => {
  const img = <img src="foo.png" />;
  t(!hasTextAlternative(img, img, device));
});

test("Returns false if an element has an empty text alternative", t => {
  const img = <img src="foo.png" alt=" " />;
  t(!hasTextAlternative(img, img, device));
});
