import { Device } from "@siteimprove/alfa-device";
import { test } from "@siteimprove/alfa-test";

import { isOffscreen as AlfaIsOffscreen } from "../../../src/node/predicate/is-offscreen";

const isOffscreen = AlfaIsOffscreen(Device.standard());

test(`isOffscreen() returns true for an element that has been pulled offscreen
      by position: absolute and left: 9999px`, (t) => {
  const element = (
    <div style={{ position: "absolute", left: "9999px" }}>Hello world</div>
  );

  t.equal(isOffscreen(element), true);
});

test(`isOffscreen() returns true for an element that has been pulled offscreen
      by position: absolute and left: -9999px`, (t) => {
  const element = (
    <div style={{ position: "absolute", left: "-9999px" }}>Hello world</div>
  );

  t.equal(isOffscreen(element), true);
});

test(`isOffscreen() returns true for an element that has been pulled offscreen
      by position: absolute and right: 9999px`, (t) => {
  const element = (
    <div style={{ position: "absolute", right: "9999px" }}>Hello world</div>
  );

  t.equal(isOffscreen(element), true);
});

test(`isOffscreen() returns true for an element that has been pulled offscreen
      by position: absolute and right: -9999px`, (t) => {
  const element = (
    <div style={{ position: "absolute", right: "-9999px" }}>Hello world</div>
  );

  t.equal(isOffscreen(element), true);
});

test(`isOffscreen() returns true for an element that has been pulled offscreen
      by position: absolute and top: -9999px`, (t) => {
  const element = (
    <div style={{ position: "absolute", top: "-9999px" }}>Hello world</div>
  );

  t.equal(isOffscreen(element), true);
});

test(`isOffscreen() returns true for an element that has been pulled offscreen
      by position: margin-left: -9999px`, (t) => {
  const element = <div style={{ marginLeft: "-9999px" }}>Hello world</div>;

  t.equal(isOffscreen(element), true);
});
