import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import R111 from "../../dist/sia-r111/rule";

import { evaluate } from "../common/evaluate";

import { failed, inapplicable, passed } from "../common/outcome";

import { TargetSize } from "../../dist/common/outcome/target-size";

test("evaluate() passes button with clickable area of exactly 44x44 pixels", async (t) => {
  const device = Device.standard();

  const target = (
    <button
      style={{ width: "44px", height: "44px", borderRadius: "0" }}
      box={{ device, x: 8, y: 8, width: 44, height: 44 }}
    >
      Hello
    </button>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R111, { document, device }), [
    passed(R111, target, {
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

  t.deepEqual(await evaluate(R111, { document, device }), [
    passed(R111, target, {
      1: TargetSize.IsUserAgentControlled(
        "",
        target.getBoundingBox(device).getUnsafe(),
      ),
    }),
  ]);
});

test("evaluate() fails button with clickable area of less than 44x44 pixels", async (t) => {
  const device = Device.standard();

  const target = (
    <button
      style={{ width: "43px", height: "43px", borderRadius: "0" }}
      box={{ device, x: 8, y: 8, width: 43, height: 43 }}
    >
      Hello
    </button>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R111, { document, device }), [
    failed(R111, target, {
      1: TargetSize.HasInsufficientSize(
        "Hello",
        target.getBoundingBox(device).getUnsafe(),
      ),
    }),
  ]);
});

test("evaluate() is inapplicable to disabled button", async (t) => {
  const device = Device.standard();

  const target = (
    <button
      style={{ width: "43px", height: "43px", borderRadius: "0" }}
      box={{ device, x: 8, y: 8, width: 43, height: 43 }}
      disabled
    >
      Hello
    </button>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R111, { document, device }), [inapplicable(R111)]);
});

test("evaluate() is inapplicable to button with pointer-events: none", async (t) => {
  const device = Device.standard();

  const target = (
    <button
      style={{
        width: "43px",
        height: "43px",
        borderRadius: "0",
        pointerEvents: "none",
      }}
      box={{ device, x: 8, y: 8, width: 43, height: 43 }}
    >
      Hello
    </button>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R111, { document, device }), [inapplicable(R111)]);
});

test("evaluate() is inapplicable when there is no layout information", async (t) => {
  const device = Device.standard();

  const target = (
    <button style={{ width: "44px", height: "44px", borderRadius: "0" }}>
      Hello
    </button>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R111, { document, device }), [inapplicable(R111)]);
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

  t.deepEqual(await evaluate(R111, { document, device }), [inapplicable(R111)]);
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

  t.deepEqual(await evaluate(R111, { document, device }), [
    failed(R111, target, {
      1: TargetSize.HasInsufficientSize(
        "hello",
        target.getBoundingBox(device).getUnsafe(),
      ),
    }),
  ]);
});
