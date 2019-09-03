import { getDefaultDevice } from "@siteimprove/alfa-device";
import { test } from "@siteimprove/alfa-test";
import { jsx } from "../jsx";
import { isRendered } from "../src/is-rendered";

const device = getDefaultDevice();

test("Returns true when an element is rendered", t => {
  const div = <div />;
  t.equal(isRendered(div, div, device), true);
});

test("Returns false when an element has display: none", t => {
  const div = <div style="display: none" />;
  t.equal(isRendered(div, div, device), false);
});

test("Returns false when the parent of an element has display: none", t => {
  const span = <span />;
  const div = <div style="display: none">{span}</div>;
  t.equal(isRendered(span, div, device), false);
});
