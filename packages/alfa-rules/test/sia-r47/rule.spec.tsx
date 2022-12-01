import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R47, { Outcomes } from "../../src/sia-r47/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes meta-viewport elements who let users zoom", async (t) => {
  const target = <meta name="viewport" content="user-scalable=yes" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R47, { document }), [
    passed(R47, target, { 1: Outcomes.MetaDoesNotPreventZoom }),
  ]);
});

test("evaluate() passes meta-viewport elements with a mixed-case content", async (t) => {
  const target = <meta name="viewport" content="USER-scalable=YES" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R47, { document }), [
    passed(R47, target, { 1: Outcomes.MetaDoesNotPreventZoom }),
  ]);
});

test("evaluate() passes meta-viewport elements with large enough scale", async (t) => {
  const target = <meta name="viewport" content="maximum-scale=6.0" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R47, { document }), [
    passed(R47, target, { 1: Outcomes.MetaDoesNotPreventZoom }),
  ]);
});

test("evaluate() fails meta-viewport elements with too small scale", async (t) => {
  const target = <meta name="viewport" content="maximum-scale=1.5" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R47, { document }), [
    failed(R47, target, { 1: Outcomes.MetaDoesPreventZoom }),
  ]);
});

test("evaluate() fails meta-viewport elements who prevent zoom", async (t) => {
  const target = <meta name="viewport" content="user-scalable=no" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R47, { document }), [
    failed(R47, target, { 1: Outcomes.MetaDoesPreventZoom }),
  ]);
});

test("evaluate() is inapplicable to other meta elements", async (t) => {
  const document = h.document([<meta charset="UTF-8" />]);

  t.deepEqual(await evaluate(R47, { document }), [inapplicable(R47)]);
});

test("evaluate() is inapplicable when meta-viewport has no `content`", async (t) => {
  const document = h.document([<meta name="viewport" />]);

  t.deepEqual(await evaluate(R47, { document }), [inapplicable(R47)]);
});

test("evaluate() is inapplicable to meta-viewport elements who don't affect zoom", async (t) => {
  const document = h.document([
    <meta name="viewport" content="width=device-width" />,
  ]);

  t.deepEqual(await evaluate(R47, { document }), [inapplicable(R47)]);
});
