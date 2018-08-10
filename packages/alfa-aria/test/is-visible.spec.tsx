import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { isVisible } from "../src/is-visible";

test("Returns true on a visible element", t => {
  const div = <div />;
  t(isVisible(div, div));
});

test("Returns false on a hidden element", t => {
  const div = <div style="visibility:hidden;" />;
  t(!isVisible(div, div));
});

test("Returns false on a aria hidden element", t => {
  const div = <div aria-hidden="true" />;
  t(!isVisible(div, div));
});

test("Returns false on a implicitly hidden element using display", t => {
  const child = <button />;
  const div = <div style="display:none;">{child}</div>;
  t(!isVisible(child, div));
});

test("Returns false on a implicitly hidden element using visibility", t => {
  const child = <button />;
  const div = <div style="visibility:hidden;">{child}</div>;
  t(!isVisible(child, div));
});

test("Returns false on a implicitly hidden element using aria", t => {
  const child = <button />;
  const div = <div aria-hidden="true">{child}</div>;
  t(!isVisible(child, div));
});
