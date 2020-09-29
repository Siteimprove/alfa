import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R84, { Outcomes } from "../../src/sia-r84/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed } from "../common/outcome";

test("evaluate() passes a scrollable element that is focusable", async (t) => {
  const target = (
    <div style={{ height: "1.5em", overflow: "scroll" }} tabindex="0">
      Hello world
    </div>
  );

  const document = Document.of([target]);

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

  const document = Document.of([target]);

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

  const document = Document.of([target]);

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

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R84, { document }), [
    failed(R84, target, {
      1: Outcomes.IsNotReachable,
    }),
  ]);
});
