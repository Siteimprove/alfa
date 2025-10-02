import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R118, { Outcomes } from "../../dist/sia-r118/rule.js";

import { evaluate } from "../common/evaluate.js";
import { passed, failed, inapplicable } from "../common/outcome.js";

test("evaluate() passes focusable elements with logical focus order", async (t) => {
  const target = <input type="text" tabIndex="1" />;
  const document = h.document([
    <html>
      <body>
        <input type="text" tabIndex="0" />
        {target}
        <input type="text" tabIndex="2" />
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R118, { document }), [
    passed(R118, target, {
      1: Outcomes.HasLogicalFocusOrder,
    }),
  ]);
});

test("evaluate() fails focusable elements with illogical focus order", async (t) => {
  const target = <input type="text" tabIndex="3" />;
  const document = h.document([
    <html>
      <body>
        <input type="text" tabIndex="1" />
        <input type="text" tabIndex="2" />
        {target}
        <input type="text" tabIndex="0" />
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R118, { document }), [
    failed(R118, target, {
      1: Outcomes.HasIllogicalFocusOrder,
    }),
  ]);
});

test("evaluate() passes first focusable element", async (t) => {
  const target = <input type="text" />;
  const document = h.document([
    <html>
      <body>
        {target}
        <input type="text" />
        <button>Click me</button>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R118, { document }), [
    passed(R118, target, {
      1: Outcomes.HasLogicalFocusOrder,
    }),
  ]);
});

test("evaluate() is inapplicable to non-focusable elements", async (t) => {
  const document = h.document([
    <html>
      <body>
        <div>Not focusable</div>
        <span>Also not focusable</span>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R118, { document }), [inapplicable(R118)]);
});

test("evaluate() is inapplicable to hidden focusable elements", async (t) => {
  const document = h.document([
    <html>
      <body>
        <input type="text" hidden />
        <button hidden>Hidden button</button>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R118, { document }), [inapplicable(R118)]);
});

test("evaluate() passes elements with natural tab order", async (t) => {
  const target = <button>Second button</button>;
  const document = h.document([
    <html>
      <body>
        <button>First button</button>
        {target}
        <button>Third button</button>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R118, { document }), [
    passed(R118, target, {
      1: Outcomes.HasLogicalFocusOrder,
    }),
  ]);
});

test("evaluate() handles mixed focusable elements", async (t) => {
  const target = <select>
    <option>Option 1</option>
    <option>Option 2</option>
  </select>;
  
  const document = h.document([
    <html>
      <body>
        <input type="text" />
        {target}
        <textarea></textarea>
        <button>Submit</button>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R118, { document }), [
    passed(R118, target, {
      1: Outcomes.HasLogicalFocusOrder,
    }),
  ]);
});
