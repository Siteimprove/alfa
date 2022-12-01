import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R95, { Outcomes } from "../../src/sia-dr95/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes an iframe with negative tabindex and no interactive content", async (t) => {
  const target = (
    <iframe tabindex="-1">{h.document([<p>Hello World!</p>])}</iframe>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R95, { document }), [
    passed(R95, target, { 1: Outcomes.HasNoInteractiveElement }),
  ]);
});

test("evaluate() passes an iframe with negative tabindex and a non-tabbable interactive element", async (t) => {
  const target = (
    <iframe tabindex="-1">
      {h.document([<button tabindex="-1">Hello World!</button>])}
    </iframe>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R95, { document }), [
    passed(R95, target, { 1: Outcomes.HasNoInteractiveElement }),
  ]);
});

test("evaluate() passes an iframe with negative tabindex and an invisible interactive element", async (t) => {
  const target = (
    <iframe tabindex="-1">
      {h.document([<button hidden>Hello World!</button>])}
    </iframe>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R95, { document }), [
    passed(R95, target, { 1: Outcomes.HasNoInteractiveElement }),
  ]);
});

test("evaluate() passes an invisible iframe with negative tabindex and an interactive element", async (t) => {
  const target = (
    <iframe tabindex="-1" hidden>
      {h.document([<button>Hello World!</button>])}
    </iframe>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R95, { document }), [
    passed(R95, target, { 1: Outcomes.HasNoInteractiveElement }),
  ]);
});

test("evaluate() fails an iframe with negative tabindex and an interactive element", async (t) => {
  const error = <button>Hello World!</button>;

  const target = <iframe tabindex="-1">{h.document([error])}</iframe>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R95, { document }), [
    failed(R95, target, { 1: Outcomes.HasInteractiveElement([error]) }),
  ]);
});

test("evaluate() is inapplicable on an iframe with non-negative tabindex", async (t) => {
  const document = h.document([
    <iframe tabindex="0">{h.document([<button>Hello World!</button>])}</iframe>,
  ]);

  t.deepEqual(await evaluate(R95, { document }), [inapplicable(R95)]);
});

test("evaluate() is inapplicable on an iframe with no tabindex", async (t) => {
  const document = h.document([
    <iframe>{h.document([<button>Hello World!</button>])}</iframe>,
  ]);

  t.deepEqual(await evaluate(R95, { document }), [inapplicable(R95)]);
});

test("evaluate() is inapplicable when there is no iframe", async (t) => {
  const document = h.document([<button>Hello World!</button>]);

  t.deepEqual(await evaluate(R95, { document }), [inapplicable(R95)]);
});
