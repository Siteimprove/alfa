import { Document } from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import R95, { Outcomes } from "../../src/sia-r95/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes an iframe with negative tabindex and no interactive content", async (t) => {
  const target = (
    <iframe tabindex="-1">{Document.of([<p>Hello World!</p>])}</iframe>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R95, { document }), [
    passed(R95, target, { 1: Outcomes.HasNoInteractiveElement }),
  ]);
});

test("evaluate() passes an iframe with negative tabindex and a non-tabbable interactive element", async (t) => {
  const target = (
    <iframe tabindex="-1">
      {Document.of([<button tabindex="-1">Hello World!</button>])}
    </iframe>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R95, { document }), [
    passed(R95, target, { 1: Outcomes.HasNoInteractiveElement }),
  ]);
});

test("evaluate() passes an iframe with negative tabindex and an invisible interactive element", async (t) => {
  const target = (
    <iframe tabindex="-1">
      {Document.of([<button hidden>Hello World!</button>])}
    </iframe>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R95, { document }), [
    passed(R95, target, { 1: Outcomes.HasNoInteractiveElement }),
  ]);
});

test("evaluate() passes an invisible iframe with negative tabindex and an interactive element", async (t) => {
  const target = (
    <iframe tabindex="-1" hidden>
      {Document.of([<button>Hello World!</button>])}
    </iframe>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R95, { document }), [
    passed(R95, target, { 1: Outcomes.HasNoInteractiveElement }),
  ]);
});

test("evaluate() fails an iframe with negative tabindex and an interactive element", async (t) => {
  const target = (
    <iframe tabindex="-1">
      {Document.of([<button>Hello World!</button>])}
    </iframe>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R95, { document }), [
    failed(R95, target, { 1: Outcomes.HasInteractiveElement }),
  ]);
});

test("evaluate() is inapplicable on an iframe with non-negative tabindex", async (t) => {
  const document = Document.of([
    <iframe tabindex="0">
      {Document.of([<button>Hello World!</button>])}
    </iframe>,
  ]);

  t.deepEqual(await evaluate(R95, { document }), [inapplicable(R95)]);
});

test("evaluate() is inapplicable on an iframe with no tabindex", async (t) => {
  const document = Document.of([
    <iframe>{Document.of([<button>Hello World!</button>])}</iframe>,
  ]);

  t.deepEqual(await evaluate(R95, { document }), [inapplicable(R95)]);
});

test("evaluate() is inapplicable when there is no iframe", async (t) => {
  const document = Document.of([<button>Hello World!</button>]);

  t.deepEqual(await evaluate(R95, { document }), [inapplicable(R95)]);
});
