import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { isVisible } from "../src/is-visible";

const device = getDefaultDevice();

test("Returns true if an element is not visible to assistive technology", t => {
  const div = <div />;
  t(isVisible(div, div, device));
});

test("Returns true if an element has display: block", t => {
  const div = <div style="display: block" />;
  t(isVisible(div, div, device));
});

test("Returns true if an element has visibility: visible", t => {
  const div = <div style="visibility: visible" />;
  t(isVisible(div, div, device));
});

test("Returns false when an element is hidden using visibility: hidden", t => {
  const div = <div style="visibility: hidden" />;
  t(!isVisible(div, div, device));
});

test("Returns false when an element is hidden using display: none", t => {
  const div = <div style="display: none" />;
  t(!isVisible(div, div, device));
});

test("Returns false when an element is hidden using aria-hidden=true", t => {
  const div = <div aria-hidden="true" />;
  t(!isVisible(div, div, device));
});

test("Returns false when the parent of an element is hidden using visibility: hidden", t => {
  const child = <button />;
  const div = <div style="visibility: hidden">{child}</div>;
  t(!isVisible(child, div, device));
});

test("Returns false when the parent of an element is hidden using visibility: collapse", t => {
  const child = <button />;
  const div = <div style="visibility: collapse">{child}</div>;
  t(!isVisible(child, div, device));
});

test("Returns false when the parent of an element is hidden using display: none", t => {
  const child = <button />;
  const div = <div style="display: none">{child}</div>;
  t(!isVisible(child, div, device));
});

test("Returns false when the parent of an element is hidden using aria-hidden=true", t => {
  const child = <button />;
  const div = <div aria-hidden="true">{child}</div>;
  t(!isVisible(child, div, device));
});
