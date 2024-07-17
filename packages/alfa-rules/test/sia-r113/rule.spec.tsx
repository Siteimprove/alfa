import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Rectangle } from "@siteimprove/alfa-rectangle";

import R113 from "../../dist/sia-r113/rule.js";
import { evaluate } from "../common/evaluate.js";
import { failed, inapplicable, passed } from "../common/outcome.js";
import { TargetSize } from "../../dist/common/outcome/target-size.js";

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
      1: TargetSize.HasSufficientSize(
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
      1: TargetSize.IsUserAgentControlled(
        "",
        target.getBoundingBox(device).getUnsafe(),
      ),
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
      1: TargetSize.HasSufficientSpacing(
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
      style={{
        position: "absolute",
        top: "80px",
        left: "80px",
        width: "20px",
        height: "20px",
        borderRadius: "0",
      }}
      box={{ device, x: 80, y: 80, width: 20, height: 20 }}
    >
      Hello
    </button>
  );

  const target2 = (
    <button
      style={{
        position: "absolute",
        top: "58px",
        left: "99px",
        width: "23px",
        height: "23px",
        borderRadius: "0",
      }}
      box={{ device, x: 99, y: 58, width: 23, height: 23 }}
    >
      World
    </button>
  );

  const document = h.document([target1, target2]);

  t.deepEqual(await evaluate(R113, { document, device }), [
    passed(R113, target1, {
      1: TargetSize.HasSufficientSpacing(
        "Hello",
        target1.getBoundingBox(device).getUnsafe(),
      ),
    }),
    passed(R113, target2, {
      1: TargetSize.HasSufficientSpacing(
        "World",
        target2.getBoundingBox(device).getUnsafe(),
      ),
    }),
  ]);
});

test("evaluate() passes undersized button with vertically adjacent undersized button that is not displayed", async (t) => {
  const device = Device.standard();

  // The 24px diameter circles of the targets does not intersect with the bounding box of the other target, but the circles do intersect
  const target1 = (
    <button
      style={{
        position: "absolute",
        top: "80px",
        left: "80px",
        width: "20px",
        height: "20px",
        borderRadius: "0",
      }}
      box={{ device, x: 80, y: 80, width: 20, height: 20 }}
    >
      Hello
    </button>
  );

  const target2 = (
    <button
      style={{
        position: "absolute",
        top: "58px",
        left: "80px",
        width: "20px",
        height: "20px",
        borderRadius: "0",
        display: "none",
      }}
      box={{ device, x: 80, y: 58, width: 20, height: 20 }}
    >
      World
    </button>
  );

  const document = h.document([target1, target2]);

  t.deepEqual(await evaluate(R113, { document, device }), [
    passed(R113, target1, {
      1: TargetSize.HasSufficientSpacing(
        "Hello",
        target1.getBoundingBox(device).getUnsafe(),
      ),
    }),
  ]);
});

test("evaluate() passes undersized button with vertically adjacent undersized button that is hidden", async (t) => {
  const device = Device.standard();

  // The 24px diameter circles of the targets does not intersect with the bounding box of the other target, but the circles do intersect
  const target1 = (
    <button
      style={{
        position: "absolute",
        top: "80px",
        left: "80px",
        width: "20px",
        height: "20px",
        borderRadius: "0",
      }}
      box={{ device, x: 80, y: 80, width: 20, height: 20 }}
    >
      Hello
    </button>
  );

  const target2 = (
    <button
      style={{
        position: "absolute",
        top: "58px",
        left: "80px",
        width: "20px",
        height: "20px",
        borderRadius: "0",
        visibility: "hidden",
      }}
      box={{ device, x: 80, y: 58, width: 20, height: 20 }}
    >
      World
    </button>
  );

  const document = h.document([target1, target2]);

  t.deepEqual(await evaluate(R113, { document, device }), [
    passed(R113, target1, {
      1: TargetSize.HasSufficientSpacing(
        "Hello",
        target1.getBoundingBox(device).getUnsafe(),
      ),
    }),
  ]);
});

test("evaluate() fails undersized button with vertically adjacent undersized button", async (t) => {
  const device = Device.standard();

  // The 24px diameter circles of the targets does not intersect with the bounding box of the other target, but the circles do intersect
  const target1 = (
    <button
      style={{
        position: "absolute",
        top: "80px",
        left: "80px",
        width: "20px",
        height: "20px",
        borderRadius: "0",
      }}
      box={{ device, x: 80, y: 80, width: 20, height: 20 }}
    >
      Hello
    </button>
  );

  const target2 = (
    <button
      style={{
        position: "absolute",
        top: "58px",
        left: "80px",
        width: "20px",
        height: "20px",
        borderRadius: "0",
      }}
      box={{ device, x: 80, y: 58, width: 20, height: 20 }}
    >
      World
    </button>
  );

  const document = h.document([target1, target2]);

  t.deepEqual(await evaluate(R113, { document, device }), [
    failed(R113, target1, {
      1: TargetSize.HasInsufficientSizeAndSpacing(
        "Hello",
        target1.getBoundingBox(device).getUnsafe(),
        [target2],
      ),
    }),
    failed(R113, target2, {
      1: TargetSize.HasInsufficientSizeAndSpacing(
        "World",
        target2.getBoundingBox(device).getUnsafe(),
        [target1],
      ),
    }),
  ]);
});

test("evaluate() fails an undersized button whose 24px diameter circle intersects other targets bounding box, but not other targets circle", async (t) => {
  const device = Device.standard();

  const target1 = (
    <button
      style={{
        position: "absolute",
        top: "80px",
        left: "80px",
        width: "15px",
        height: "15px",
        borderRadius: "0",
      }}
      box={{ device, x: 80, y: 80, width: 15, height: 15 }}
    >
      Hello
    </button>
  );

  const target2 = (
    <button
      style={{
        position: "absolute",
        top: "56px",
        left: "91px",
        width: "23px",
        height: "23px",
        borderRadius: "0",
      }}
      box={{ device, x: 91, y: 56, width: 23, height: 23 }}
    >
      World
    </button>
  );

  const document = h.document([target1, target2]);

  t.deepEqual(await evaluate(R113, { document, device }), [
    failed(R113, target1, {
      1: TargetSize.HasInsufficientSizeAndSpacing(
        "Hello",
        target1.getBoundingBox(device).getUnsafe(),
        [target2],
      ),
    }),
    passed(R113, target2, {
      1: TargetSize.HasSufficientSpacing(
        "World",
        target2.getBoundingBox(device).getUnsafe(),
      ),
    }),
  ]);
});

test("evaluate() fails an undersized button next to an image inside a link", async (t) => {
  const device = Device.standard();

  const neighbor = (
    <a href="/" box={{ device, x: 8, y: 348, width: 536, height: 17 }}>
      <img src="foo" box={{ device, x: 8, y: 8, width: 536, height: 354 }} />
    </a>
  );

  const target = (
    <button box={{ device, x: 544, y: 8, width: 20, height: 20 }}>x</button>
  );

  const document = h.document(
    [neighbor, target],
    [
      h.sheet([
        h.rule.style("button", {
          position: "absolute",
          width: "20px",
          height: "20px",
          top: "8px",
          left: "544px",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R113, { document, device }), [
    passed(R113, neighbor, {
      1: TargetSize.HasSufficientSize("", Rectangle.of(8, 8, 536, 357)),
    }),
    failed(R113, target, {
      1: TargetSize.HasInsufficientSizeAndSpacing(
        "x",
        Rectangle.of(544, 8, 20, 20),
        [neighbor],
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

test("evaluate() is inapplicable to <area> elements", async (t) => {
  const device = Device.standard();

  const img = <img src="foo.jpg" alt="foo" usemap="#bar" width="500" />;
  const map = (
    <map name="bar">
      <area
        shape="rect"
        coords="8,8,31,31"
        href="foo.html"
        box={{ device, x: 8, y: 8, width: 0, height: 0 }}
      />
    </map>
  );

  const document = h.document([img, map]);

  t.deepEqual(await evaluate(R113, { document, device }), [inapplicable(R113)]);
});

test("evaluate() is inapplicable to button with display: none", async (t) => {
  const device = Device.standard();

  const target = (
    <button
      style={{ width: "24px", height: "24px", display: "none" }}
      box={{ device, x: 8, y: 8, width: 24, height: 24 }}
    >
      Hello
    </button>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R113, { document, device }), [inapplicable(R113)]);
});

test("evaluate() is inapplicable to button with visibility: hidden", async (t) => {
  const device = Device.standard();

  const target = (
    <button
      style={{ width: "24px", height: "24px", visibility: "hidden" }}
      box={{ device, x: 8, y: 8, width: 24, height: 24 }}
    >
      Hello
    </button>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R113, { document, device }), [inapplicable(R113)]);
});

test("evaluate() is inapplicable when link is part of text", async (t) => {
  const device = Device.standard();

  const target = (
    <a href="#" box={{ device, x: 44, y: 80, width: 37, height: 17 }}>
      world
    </a>
  );

  const div = (
    <div>
      <span>hello</span>
      {target}
    </div>
  );

  const document = h.document([div]);

  t.deepEqual(await evaluate(R113, { document, device }), [inapplicable(R113)]);
});

test("evaluate() is applicable when link is not part of text", async (t) => {
  const device = Device.standard();

  const target = (
    <a href="#" box={{ device, x: 44, y: 80, width: 37, height: 17 }}>
      hello
    </a>
  );

  const div = <p>{target}</p>;

  const document = h.document([div]);

  t.deepEqual(await evaluate(R113, { document, device }), [
    passed(R113, target, {
      1: TargetSize.HasSufficientSpacing(
        "hello",
        target.getBoundingBox(device).getUnsafe(),
      ),
    }),
  ]);
});

test("evaluate() is applicable when button is not clipped by parent due to overflow: visible", async (t) => {
  const device = Device.standard();

  const target = (
    <button
      box={{
        device,
        x: 134,
        y: 241,
        width: 50,
        height: 20,
      }}
    >
      foo
    </button>
  );
  const div = (
    <div box={{ device, x: 108, y: 100, width: 102, height: 102 }}>
      {target}
    </div>
  );

  const document = h.document(
    [div],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "visible",
          margin: "100px 100px",
          width: "100px",
          height: "100px",
        }),
        h.rule.style("button", {
          position: "relative",
          width: "50px",
          height: "20px",
          top: "140px",
          left: "25px",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R113, { document, device }), [
    passed(R113, target, {
      1: TargetSize.HasSufficientSpacing(
        "foo",
        target.getBoundingBox(device).getUnsafe(),
      ),
    }),
  ]);
});

test("evaluate() is inapplicable when button is clipped by parent", async (t) => {
  const device = Device.standard();

  const button = (
    <button
      box={{
        device,
        x: 134,
        y: 241,
        width: 50,
        height: 20,
      }}
    >
      foo
    </button>
  );
  const div = (
    <div box={{ device, x: 108, y: 100, width: 102, height: 102 }}>
      {button}
    </div>
  );

  const document = h.document(
    [div],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          margin: "100px 100px",
          width: "100px",
          height: "100px",
        }),
        h.rule.style("button", {
          position: "relative",
          width: "50px",
          height: "20px",
          top: "140px",
          left: "25px",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R113, { document, device }), [inapplicable(R113)]);
});

test("evaluate() is inapplicable when button is scrolled behind parent", async (t) => {
  const device = Device.standard();

  const button = (
    <button
      box={{
        device,
        x: 134,
        y: 241,
        width: 50,
        height: 20,
      }}
    >
      foo
    </button>
  );
  const div = (
    <div box={{ device, x: 108, y: 100, width: 102, height: 102 }}>
      {button}
    </div>
  );

  const document = h.document(
    [div],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "auto",
          margin: "100px 100px",
          width: "100px",
          height: "100px",
        }),
        h.rule.style("button", {
          position: "relative",
          width: "50px",
          height: "20px",
          top: "40px",
          left: "calc(25px + 100px)",
        }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R113, { document, device }), [inapplicable(R113)]);
});
