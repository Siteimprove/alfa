import { assert, describe, it } from "vitest";

import { h } from "@siteimprove/alfa-dom";

import { Device } from "@siteimprove/alfa-device";

import R113 from "../../src/sia-r113/rule";

import { evaluate } from "../common/evaluate";

import { failed, inapplicable, passed } from "../common/outcome";

import { TargetSize } from "../../src/common/outcome/target-size";

describe("#evaluate()", () => {
  it("passes button with clickable area of exactly 24x24 pixels", async () => {
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

    assert.deepEqual(await evaluate(R113, { document, device }), [
      passed(R113, target, {
        1: TargetSize.HasSufficientSize(
          "Hello",
          target.getBoundingBox(device).getUnsafe(),
        ),
      }),
    ]);
  });

  it("passes input element regardless of size", async () => {
    const device = Device.standard();

    const target = (
      <input
        type="checkbox"
        box={{ device, x: 8, y: 8, width: 13, height: 13 }}
      ></input>
    );

    const document = h.document([target]);

    assert.deepEqual(await evaluate(R113, { document, device }), [
      passed(R113, target, {
        1: TargetSize.IsUserAgentControlled(
          "",
          target.getBoundingBox(device).getUnsafe(),
        ),
      }),
    ]);
  });

  it("passes button with clickable area of less than 24x24 pixels and no adjacent targets", async () => {
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

    assert.deepEqual(await evaluate(R113, { document, device }), [
      passed(R113, target, {
        1: TargetSize.HasSufficientSpacing(
          "Hello",
          target.getBoundingBox(device).getUnsafe(),
        ),
      }),
    ]);
  });

  it("passes button with clickable area of less than 24x24 pixels and a diagonally adjacent undersized target", async () => {
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

    assert.deepEqual(await evaluate(R113, { document, device }), [
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

  it("passes undersized button with vertically adjacent undersized button that is not displayed", async () => {
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

    assert.deepEqual(await evaluate(R113, { document, device }), [
      passed(R113, target1, {
        1: TargetSize.HasSufficientSpacing(
          "Hello",
          target1.getBoundingBox(device).getUnsafe(),
        ),
      }),
    ]);
  });

  it("passes undersized button with vertically adjacent undersized button that is hidden", async () => {
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

    assert.deepEqual(await evaluate(R113, { document, device }), [
      passed(R113, target1, {
        1: TargetSize.HasSufficientSpacing(
          "Hello",
          target1.getBoundingBox(device).getUnsafe(),
        ),
      }),
    ]);
  });

  it("fails undersized button with vertically adjacent undersized button", async () => {
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

    assert.deepEqual(await evaluate(R113, { document, device }), [
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

  it("fails an undersized button whose 24px diameter circle intersects other targets bounding box, but not other targets circle", async () => {
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

    assert.deepEqual(await evaluate(R113, { document, device }), [
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

  it("is inapplicable to disabled button", async () => {
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

    assert.deepEqual(await evaluate(R113, { document, device }), [
      inapplicable(R113),
    ]);
  });

  it("is inapplicable to button with pointer-events: none", async () => {
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

    assert.deepEqual(await evaluate(R113, { document, device }), [
      inapplicable(R113),
    ]);
  });

  it("is inapplicable when there is no layout information", async () => {
    const device = Device.standard();

    const target = (
      <button style={{ width: "24px", height: "24px", borderRadius: "0" }}>
        Hello
      </button>
    );

    const document = h.document([target]);

    assert.deepEqual(await evaluate(R113, { document, device }), [
      inapplicable(R113),
    ]);
  });

  it("is inapplicable to <area> elements", async () => {
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

    assert.deepEqual(await evaluate(R113, { document, device }), [
      inapplicable(R113),
    ]);
  });

  it("is inapplicable to button with display: none", async () => {
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

    assert.deepEqual(await evaluate(R113, { document, device }), [
      inapplicable(R113),
    ]);
  });

  it("is inapplicable to button with visibility: hidden", async () => {
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

    assert.deepEqual(await evaluate(R113, { document, device }), [
      inapplicable(R113),
    ]);
  });

  it("is inapplicable when link is part of text", async () => {
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

    assert.deepEqual(await evaluate(R113, { document, device }), [
      inapplicable(R113),
    ]);
  });

  it("is applicable when link is not part of text", async () => {
    const device = Device.standard();

    const target = (
      <a href="#" box={{ device, x: 44, y: 80, width: 37, height: 17 }}>
        hello
      </a>
    );

    const div = <p>{target}</p>;

    const document = h.document([div]);

    assert.deepEqual(await evaluate(R113, { document, device }), [
      passed(R113, target, {
        1: TargetSize.HasSufficientSpacing(
          "hello",
          target.getBoundingBox(device).getUnsafe(),
        ),
      }),
    ]);
  });
});
