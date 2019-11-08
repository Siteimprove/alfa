import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { isVisible } from "../src/is-visible";

const device = Device.getDefaultDevice();

test("Returns true when an element is visible", t => {
  const div = <div />;
  t.equal(isVisible(div, div, device), true);
});

test("Returns false when an element has display: none", t => {
  const div = <div style="display: none" />;
  t.equal(isVisible(div, div, device), false);
});

test("Returns false when an element has visibility: hidden", t => {
  const div = <div style="visibility: hidden" />;
  t.equal(isVisible(div, div, device), false);
});

test("Returns false when the parent of an element has display: none", t => {
  const span = <span />;
  const div = <div style="display: none">{span}</div>;
  t.equal(isVisible(span, div, device), false);
});

test("Returns false when the parent of an element has visibility: hidden", t => {
  const span = <span />;
  const div = <div style="visibility: hidden">{span}</div>;
  t.equal(isVisible(span, div, device), false);
});

test("Returns true when the parent of an element has visibility: hidden but the element has visibility: visible", t => {
  const span = <span style="visibility: visible" />;
  const div = <div style="visibility: hidden">{span}</div>;
  t.equal(isVisible(span, div, device), true);
});
