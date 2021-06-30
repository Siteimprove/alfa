import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R96 from "../../src/sia-r96/rule";
import { RefreshDelay as Outcomes } from "../../src/common/outcome/refresh-delay";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluates() passes when there is an immediate refresh", async (t) => {
  const target = (
    <meta http-equiv="refresh" content="0; URL='https://w3c.org'" />
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R96, { document }), [
    passed(R96, target, { 1: Outcomes.HasImmediateRefresh }),
  ]);
});

test("evaluates() fails when there is a delayed refresh", async (t) => {
  const target = (
    <meta http-equiv="refresh" content="30; URL='https://w3c.org'" />
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R96, { document }), [
    failed(R96, target, { 1: Outcomes.HasDelayedRefresh }),
  ]);
});

test("evaluates() fails when there is a refresh after 20h", async (t) => {
  const target = (
    <meta http-equiv="refresh" content="72001; URL='https://w3c.org'" />
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R96, { document }), [
    failed(R96, target, { 1: Outcomes.HasDelayedRefresh }),
  ]);
});

test("evaluates() only considers the first <meta> element", async (t) => {
  const target = (
    <meta http-equiv="refresh" content="0; URL='https://w3c.org'" />
  );
  const ignored = (
    <meta http-equiv="refresh" content="30; URL='https://w3c.org'" />
  );

  const document = h.document([target, ignored]);

  t.deepEqual(await evaluate(R96, { document }), [
    passed(R96, target, { 1: Outcomes.HasImmediateRefresh }),
  ]);
});

test("evaluate() is inapplicable when there is no <meta> element", async (t) => {
  const document = h.document([<div>Foo</div>]);

  t.deepEqual(await evaluate(R96, { document }), [inapplicable(R96)]);
});

test("evaluate() is inapplicable when there is no <meta refresh> element", async (t) => {
  const document = h.document([<meta content="30" />]);

  t.deepEqual(await evaluate(R96, { document }), [inapplicable(R96)]);
});

test("evaluate() is inapplicable when the content attribute is invalid", async (t) => {
  // ':' instead of ';'
  const document = h.document([
    <meta http-equiv="refresh" content="0: URL='https://w3c.org'" />,
  ]);

  t.deepEqual(await evaluate(R96, { document }), [inapplicable(R96)]);
});
