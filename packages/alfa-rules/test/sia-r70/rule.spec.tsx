import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R70, { Outcomes } from "../../src/sia-r70/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a page with no deprecated / obsolete elements ", async (t) => {
  const target = (
    <html>
      <p>Lorem ipsum.</p>
    </html>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R70, { document }), [
    passed(R70, document, {
      1: Outcomes.IsNotDeprecated,
    }),
  ]);
});

test("evaluate() passes a page with a deprecated but not rendered element", async (t) => {
  const target = (
    <html>
      <p>
        Lorem <blink hidden>ipsum</blink>
      </p>
    </html>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R70, { document }), [
    passed(R70, document, {
      1: Outcomes.IsNotDeprecated,
    }),
  ]);
});

test("evaluate() fails a page with deprecated and rendered element", async (t) => {
  const blink = <blink>not</blink>;
  const target = (
    <html>
      <p>Schrödinger's cat is {blink} dead.</p>
    </html>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R70, { document }), [
    failed(R70, document, {
      1: Outcomes.IsDeprecated([blink]),
    }),
  ]);
});

test("evaluate() fails a page with deprecated visible element", async (t) => {
  const blink = <blink aria-hidden="true">not</blink>;
  const target = (
    <html>
      <p>Schrödinger's cat is {blink} dead.</p>
    </html>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R70, { document }), [
    failed(R70, document, {
      1: Outcomes.IsDeprecated([blink]),
    }),
  ]);
});

test("evaluate() fails a page with two deprecated elements in the accessibility tree", async (t) => {
  const menuitem1 = <menuitem role="menuitem">Foo</menuitem>;
  const menuitem2 = <menuitem role="menuitem">Bar</menuitem>;
  const target = (
    <html>
      <ul role="menu" style={{ position: "absolute", left: "-9999px" }}>
        {menuitem1}
        {menuitem2}
      </ul>
    </html>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R70, { document }), [
    failed(R70, document, {
      1: Outcomes.IsDeprecated([menuitem1, menuitem2]),
    }),
  ]);
});

test("evaluate() is inapplicable to non-HTML documents", async (t) => {
  const document = h.document([
    <svg xmlns="http://www.w3.org/2000/svg">
      <title>This is a circle</title>
      <circle cx="150" cy="75" r="50" fill="green"></circle>
    </svg>,
  ]);

  t.deepEqual(await evaluate(R70, { document }), [inapplicable(R70)]);
});
