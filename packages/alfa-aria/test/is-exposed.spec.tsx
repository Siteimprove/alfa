import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import { isExposed } from "../src/is-exposed";

const device = getDefaultDevice();

test("Returns true if an element is exposed in the accessibility tree", t => {
  const div = <div />;
  t(isExposed(div, div, device));
});

test("Returns false when an element is not visible to assistive technology", t => {
  const div = <div aria-hidden="true" />;
  t(!isExposed(div, div, device));
});

test("Returns false when an element has a role of presentation", t => {
  const div = <div role="presentation" />;
  t(!isExposed(div, div, device));
});

test("Returns false when an element has a role of none", t => {
  const div = <div role="presentation" />;
  t(!isExposed(div, div, device));
});
