import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { hasTextAlternative } from "../src/has-text-alternative";

test("Returns true, if there is a text alternative", t => {
  const button = <button>Button</button>;
  t(hasTextAlternative(button, button));
});

test("Returns false, if there is no text alternative", t => {
  const img = <img src="foo.png" />;
  t(!hasTextAlternative(img, img));
});
