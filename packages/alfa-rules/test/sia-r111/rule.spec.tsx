import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R111, { Outcomes } from "../../src/sia-r111/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";
import { Device } from "@siteimprove/alfa-device";

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
      1: Outcomes.HasSufficientSize,
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
      1: Outcomes.HasInsufficientSize,
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
