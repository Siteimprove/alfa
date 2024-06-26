import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R63, { Outcomes } from "../../dist/sia-r63/rule.js";

import { evaluate } from "../common/evaluate.js";
import { passed, failed, inapplicable } from "../common/outcome.js";

test("evaluate() passes an object with a non-empty name (aria-label)", async (t) => {
  const target = <object aria-label="Some object" data="foo.jpg" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R63, { document }), [
    passed(R63, target, {
      1: Outcomes.HasName,
    }),
  ]);
});

test("evaluate() passes an object with a non-empty name (title)", async (t) => {
  const target = <object title="Some object" data="foo.jpg" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R63, { document }), [
    passed(R63, target, {
      1: Outcomes.HasName,
    }),
  ]);
});

test("evaluate() fails an object with an empty name", async (t) => {
  const target = <object aria-label="" data="foo.jpg" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R63, { document }), [
    failed(R63, target, {
      1: Outcomes.HasNoName,
    }),
  ]);
});

test("evaluate() fails an object with no name", async (t) => {
  const target = <object data="foo.jpg"></object>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R63, { document }), [
    failed(R63, target, {
      1: Outcomes.HasNoName,
    }),
  ]);
});

test("evaluate() is inapplicable if there is no object", async (t) => {
  const target = <img src="foo.jpg" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R63, { document }), [inapplicable(R63)]);
});

test("evaluate() is inapplicable on empty object", async (t) => {
  const target = <object title="Some object" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R63, { document }), [inapplicable(R63)]);
});

test("evaluate() is inapplicable on non-media object", async (t) => {
  const target = <object title="Some object" data="foo.html" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R63, { document }), [inapplicable(R63)]);
});

test("evaluate() is inapplicable on non-media object (trusting type)", async (t) => {
  const target = <object title="Some object" data="foo.jpg" type="text/html" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R63, { document }), [inapplicable(R63)]);
});
