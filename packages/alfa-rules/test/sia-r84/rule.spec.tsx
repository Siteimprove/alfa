import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R84, { Outcomes } from "../../dist/sia-r84/rule.js";

import { evaluate } from "../common/evaluate.js";
import { passed, failed, inapplicable } from "../common/outcome.js";

test("evaluate() passes a scrollable element that is focusable", async (t) => {
  const target = (
    <div style={{ height: "1.5em", overflow: "scroll" }} tabindex="0">
      Hello world
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R84, { document }), [
    passed(R84, target, {
      1: Outcomes.IsReachable,
    }),
  ]);
});

test("evaluate() passes a scrollable element that has a focusable child", async (t) => {
  const target = (
    <div style={{ height: "1.5em", overflow: "scroll" }}>
      <button>Hello world</button>
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R84, { document }), [
    passed(R84, target, {
      1: Outcomes.IsReachable,
    }),
  ]);
});

test("evaluate() passes a scrollable element that has a focusable descendant", async (t) => {
  const target = (
    <div style={{ height: "1.5em", overflow: "scroll" }}>
      <div>
        <button>Hello world</button>
      </div>
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R84, { document }), [
    passed(R84, target, {
      1: Outcomes.IsReachable,
    }),
  ]);
});

test(`evaluate() fails a scrollable element that is neither focusable nor has
      focusable descendants`, async (t) => {
  const target = (
    <div style={{ height: "1.5em", overflow: "scroll" }}>Hello world</div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R84, { document }), [
    failed(R84, target, {
      1: Outcomes.IsNotReachable,
    }),
  ]);
});

test(`evaluate() fails an element that restricts its width while making overflow
      scrollable and not wrapping text`, async (t) => {
  const target = (
    <div style={{ width: "200px", overflow: "scroll", whiteSpace: "nowrap" }}>
      Hello world
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R84, { document }), [
    failed(R84, target, {
      1: Outcomes.IsNotReachable,
    }),
  ]);
});

test(`evaluate() is inapplicable to an element that restricts its width while
      hiding overflow on the x-axis`, async (t) => {
  const target = (
    <div style={{ width: "200px", overflowX: "hidden" }}>Hello world</div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R84, { document }), [inapplicable(R84)]);
});

test(`evaluate() is inapplicable to an element that restricts its height while
      hiding overflow on the y-axis`, async (t) => {
  const target = (
    <div style={{ height: "200px", overflowY: "hidden" }}>Hello world</div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R84, { document }), [inapplicable(R84)]);
});

test(`evaluate() is inapplicable to an element that restricts its width while
      making overflow scrollable, but wraps text`, async (t) => {
  const target = (
    <div style={{ width: "200px", overflow: "scroll" }}>Hello world</div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R84, { document }), [inapplicable(R84)]);
});

test("evaluate() is inapplicable to a browsing context container", async (t) => {
  const target = <iframe srcdoc="Hello World!" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R84, { document }), [inapplicable(R84)]);
});
