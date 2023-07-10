import { Device } from "@siteimprove/alfa-device";
import { test } from "@siteimprove/alfa-test";

import { isOffscreen as AlfaIsOffscreen } from "../../../src/node/predicate/is-offscreen";

const isOffscreen = AlfaIsOffscreen(Device.standard());

/*************************************************************************
 *
 * Checks **with** boxes. These use the layout heuristics.
 *
 *************************************************************************/

test(`isOffscreen() uses boxes when they are provided`, (t) => {
  // The element is actually on screen, but the box is lying to us.
  const element = (
    <div box={{ x: -100, y: -100, width: 10, height: 10 }}>Hello world</div>
  );

  t.deepEqual(isOffscreen(element), true);
});

test(`isOffscreen() returns true for elements that are on the left of the viewport`, (t) => {
  const element = (
    <div box={{ x: -100, y: 0, width: 10, height: 100 }}>Hello world</div>
  );

  t.deepEqual(isOffscreen(element), true);
});

test(`isOffscreen() returns true for elements that are on top of the viewport`, (t) => {
  const element = (
    <div box={{ x: 0, y: -100, width: 100, height: 10 }}>Hello world</div>
  );

  t.deepEqual(isOffscreen(element), true);
});

test(`isOffscreen() returns false for elements that are fully on screen`, (t) => {
  const element = (
    <div box={{ x: 100, y: 0, width: 100, height: 10 }}>Hello world</div>
  );

  t.deepEqual(isOffscreen(element), false);
});

test(`isOffscreen() returns false for elements that partially intersect the viewport on the left`, (t) => {
  const element = (
    <div box={{ x: -100, y: 0, width: 101, height: 10 }}>Hello world</div>
  );

  t.deepEqual(isOffscreen(element), false);
});

test(`isOffscreen() returns false for elements that partially intersect the viewport on the top`, (t) => {
  const element = (
    <div box={{ x: 0, y: -100, width: 10, height: 101 }}>Hello world</div>
  );

  t.deepEqual(isOffscreen(element), false);
});

/*************************************************************************
 *
 * Checks **without** boxes. These use the fallback heuristics.
 *
 *************************************************************************/

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
