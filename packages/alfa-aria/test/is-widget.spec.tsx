import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import { isWidget } from "../src/is-widget";

const device = getDefaultDevice();

test("Returns true when an element is a widget", t => {
  const button = <button>Foo</button>;
  t(isWidget(button, button, device));
});

test("Returns false when an element is not a widget", t => {
  const div = <div role="landmark" />;
  t(!isWidget(div, div, device));
});
