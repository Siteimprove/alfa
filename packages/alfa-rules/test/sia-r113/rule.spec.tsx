import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Rectangle } from "@siteimprove/alfa-rectangle";

import R113, { Outcomes, circleIntersectsRect } from "../../src/sia-r113/rule";

import { evaluate } from "../common/evaluate";
import { failed, inapplicable, passed } from "../common/outcome";

test("evaluate() passes button with clickable area of exactly 24x24 pixels", async (t) => {
  const device = Device.standard();

  const target = (
    <button
      style={{ width: "24px", height: "24px", borderRadius: "0" }}
      box={{ device, x: 8, y: 8, width: 24, height: 24 }}
    >
      Hello
    </button>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R113, { document, device }), [
    passed(R113, target, {
      1: Outcomes.HasSufficientSize(
        "Hello",
        target.getBoundingBox(device).getUnsafe(),
      ),
    }),
  ]);
});

test("evaluate() passes input element regardless of size", async (t) => {
  const device = Device.standard();

  const target = (
    <input
      type="checkbox"
      box={{ device, x: 8, y: 8, width: 13, height: 13 }}
    ></input>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R113, { document, device }), [
    passed(R113, target, {
      1: Outcomes.IsUserAgentControlled("", target.getBoundingBox(device).getUnsafe()),
    }),
  ]);
});

test("evaluate() passes button with clickable area of less than 24x24 pixels and no adjacent targets", async (t) => {
  const device = Device.standard();

  const target = (
    <button
      style={{ width: "23px", height: "23px", borderRadius: "0" }}
      box={{ device, x: 8, y: 8, width: 23, height: 23 }}
    >
      Hello
    </button>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R113, { document, device }), [
    passed(R113, target, {
      1: Outcomes.HasSufficientSpacing(
        "Hello",
        target.getBoundingBox(device).getUnsafe(),
      ),
    }),
  ]);
});

test("evaluate() passes button with clickable area of less than 24x24 pixels and a diagonally adjacent undersized target", async (t) => {
  const device = Device.standard();

  const target1 = (
    <button
      style={{ position: "absolute", top: "80px", left: "80px", width: "20px", height: "20px", borderRadius: "0" }}
      box={{ device, x: 80, y: 80, width: 20, height: 20 }}
    >
      Hello
    </button>
  );

  const target2 = (
    <button
      style={{ position: "absolute", top: "58px", left: "99px", width: "23px", height: "23px", borderRadius: "0" }}
      box={{ device, x: 99, y: 58, width: 23, height: 23 }}
    >
      World
    </button>
  );

  const document = h.document([target1, target2]);

  t.deepEqual(await evaluate(R113, { document, device }), [
    passed(R113, target1, {
      1: Outcomes.HasSufficientSpacing(
        "Hello",
        target1.getBoundingBox(device).getUnsafe(),
      ),
    }),
    passed(R113, target2, {
      1: Outcomes.HasSufficientSpacing(
        "World",
        target2.getBoundingBox(device).getUnsafe(),
      ),
    }),
  ]);
});

test("evaluate() fails undersized button with vertically adjacent undersized button", async (t) => {
  const device = Device.standard();

  // The 24px diameter circles of the targets does not intersect with the bounding box of the other target, but the circles do intersect
  const target1 = (
    <button
      style={{ position: "absolute", top: "80px", left: "80px", width: "20px", height: "20px", borderRadius: "0" }}
      box={{ device, x: 80, y: 80, width: 20, height: 20 }}
    >
      Hello
    </button>
  );

  const target2 = (
    <button
      style={{ position: "absolute", top: "58px", left: "80px", width: "20px", height: "20px", borderRadius: "0" }}
      box={{ device, x: 80, y: 58, width: 20, height: 20 }}
    >
      World
    </button>
  );

  const document = h.document([target1, target2]);

  t.deepEqual(await evaluate(R113, { document, device }), [
    failed(R113, target1, {
      1: Outcomes.HasInsufficientSizeAndSpacing(
        "Hello",
        target1.getBoundingBox(device).getUnsafe(),
      ),
    }),
    failed(R113, target2, {
      1: Outcomes.HasInsufficientSizeAndSpacing(
        "World",
        target2.getBoundingBox(device).getUnsafe(),
      ),
    }),
  ]);
});

test("evaluate() fails an undersized button whose 24px diameter circle intersects other targets bounding box, but not other targets circle", async (t) => {
  const device = Device.standard();

  const target1 = (
    <button
      style={{ position: "absolute", top: "80px", left: "80px", width: "15px", height: "15px", borderRadius: "0" }}
      box={{ device, x: 80, y: 80, width: 15, height: 15 }}
    >
      Hello
    </button>
  );

  const target2 = (
    <button
      style={{ position: "absolute", top: "56px", left: "91px", width: "23px", height: "23px", borderRadius: "0" }}
      box={{ device, x: 91, y: 56, width: 23, height: 23 }}
    >
      World
    </button>
  );

  const document = h.document([target1, target2]);

  t.deepEqual(await evaluate(R113, { document, device }), [
    failed(R113, target1, {
      1: Outcomes.HasInsufficientSizeAndSpacing(
        "Hello",
        target1.getBoundingBox(device).getUnsafe(),
      ),
    }),
    passed(R113, target2, {
      1: Outcomes.HasSufficientSpacing(
        "World",
        target2.getBoundingBox(device).getUnsafe(),
      ),
    }),
  ]);
});

test("evaluate() is inapplicable to disabled button", async (t) => {
  const device = Device.standard();

  const target = (
    <button
      style={{ width: "23px", height: "23px", borderRadius: "0" }}
      box={{ device, x: 8, y: 8, width: 23, height: 23 }}
      disabled
    >
      Hello
    </button>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R113, { document, device }), [inapplicable(R113)]);
});

test("evaluate() is inapplicable to button with pointer-events: none", async (t) => {
  const device = Device.standard();

  const target = (
    <button
      style={{
        width: "23px",
        height: "23px",
        borderRadius: "0",
        pointerEvents: "none",
      }}
      box={{ device, x: 8, y: 8, width: 23, height: 23 }}
    >
      Hello
    </button>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R113, { document, device }), [inapplicable(R113)]);
});

test("evaluate() is inapplicable when there is no layout information", async (t) => {
  const device = Device.standard();

  const target = (
    <button style={{ width: "24px", height: "24px", borderRadius: "0" }}>
      Hello
    </button>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R113, { document, device }), [inapplicable(R113)]);
});

test("circleIntersectsRect() returns false when the circle center is to the left of the radius-padded rectangle", (t) => {
  t.equal(circleIntersectsRect(3, 11, 4, Rectangle.of(8, 8, 10, 6)), false);
});

test("circleIntersectsRect() returns false when the circle center is above the radius-padded rectangle", (t) => {
  t.equal(circleIntersectsRect(13, 3, 4, Rectangle.of(8, 8, 10, 6)), false);
});

test("circleIntersectsRect() returns false when the circle center is to the right of the radius-padded rectangle", (t) => {
  t.equal(circleIntersectsRect(23, 11, 4, Rectangle.of(8, 8, 10, 6)), false);
});

test("circleIntersectsRect() returns false when the circle center is below the radius-padded rectangle", (t) => {
  t.equal(circleIntersectsRect(13, 19, 4, Rectangle.of(8, 8, 10, 6)), false);
});

test("circleIntersectsRect() returns true when the circle center is inside the radius-padded rectangle on the left, but not in the corners", (t) => {
  t.equal(circleIntersectsRect(5, 11, 4, Rectangle.of(8, 8, 10, 6)), true);
});

test("circleIntersectsRect() returns true when the circle center is inside the radius-padded rectangle on the top, but not in the corners", (t) => {
  t.equal(circleIntersectsRect(13, 5, 4, Rectangle.of(8, 8, 10, 6)), true);
});

test("circleIntersectsRect() returns true when the circle center is inside the radius-padded rectangle on the right, but not in the corners", (t) => {
  t.equal(circleIntersectsRect(21, 11, 4, Rectangle.of(8, 8, 10, 6)), true);
});

test("circleIntersectsRect() returns true when the circle center is inside the radius-padded rectangle on the bottom, but not in the corners", (t) => {
  t.equal(circleIntersectsRect(13, 17, 4, Rectangle.of(8, 8, 10, 6)), true);
});

test("circleIntersectsRect() returns true when the circle center is inside the rectangle", (t) => {
  t.equal(circleIntersectsRect(12, 12, 4, Rectangle.of(8, 8, 10, 6)), true);
});

test(`circleIntersectsRect() returns false when the circle center is inside the radius-padded rectangle in the top left corner,
      but more than a radius distance away from the corner`, (t) => {
  t.equal(circleIntersectsRect(5, 5, 4, Rectangle.of(8, 8, 10, 6)), false);
});

test(`circleIntersectsRect() returns false when the circle center is inside the radius-padded rectangle in the top right corner,
      but more than a radius distance away from the corner`, (t) => {
  t.equal(circleIntersectsRect(21, 5, 4, Rectangle.of(8, 8, 10, 6)), false);
});

test(`circleIntersectsRect() returns false when the circle center is inside the radius-padded rectangle in the bottom right corner,
      but more than a radius distance away from the corner`, (t) => {
  t.equal(circleIntersectsRect(21, 17, 4, Rectangle.of(8, 8, 10, 6)), false);
});

test(`circleIntersectsRect() returns false when the circle center is inside the radius-padded rectangle in the bottom left corner,
      but more than a radius distance away from the corner`, (t) => {
  t.equal(circleIntersectsRect(5, 17, 4, Rectangle.of(8, 8, 10, 6)), false);
});

test(`circleIntersectsRect() returns true when the circle center is inside the radius-padded rectangle in the top left corner,
      and less than a radius distance away from the corner`, (t) => {
  t.equal(circleIntersectsRect(6, 6, 4, Rectangle.of(8, 8, 10, 6)), true);
});

test(`circleIntersectsRect() returns true when the circle center is inside the radius-padded rectangle in the top right corner,
      and less than a radius distance away from the corner`, (t) => {
  t.equal(circleIntersectsRect(20, 6, 4, Rectangle.of(8, 8, 10, 6)), true);
});

test(`circleIntersectsRect() returns true when the circle center is inside the radius-padded rectangle in the bottom right corner,
      and less than a radius distance away from the corner`, (t) => {
  t.equal(circleIntersectsRect(20, 16, 4, Rectangle.of(8, 8, 10, 6)), true);
});

test(`circleIntersectsRect() returns true when the circle center is inside the radius-padded rectangle in the bottom left corner,
      and less than a radius distance away from the corner`, (t) => {
  t.equal(circleIntersectsRect(6, 16, 4, Rectangle.of(8, 8, 10, 6)), true);
});

