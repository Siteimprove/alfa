import { Outcome } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element } from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { Predicate } from "@siteimprove/alfa-predicate";
import { test } from "@siteimprove/alfa-test";
import { Page } from "@siteimprove/alfa-web";

import R53, { Outcomes } from "../../src/sia-r53/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const { and } = Predicate;

const device = Device.standard();

function getById(document: Document, id: string): Element {
  return document
    .descendants()
    .find(and(Element.isElement, (element) => element.id.includes(id)))
    .get();
}

function passes<Q>(
  document: Document,
  ...ids: Array<string>
): Array<Outcome.Passed<Page, Element, Q>> {
  return ids.map((id) =>
    passed(R53, getById(document, id), { 1: Outcomes.isStructured })
  );
}

test("evaluate() passes when the document headings are structured", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <p>Lorem ipsum…</p>
        <h1 id="p1">Part one</h1>
        <p>Lorem ipsum…</p>
        <h2 id="c11">Chapter one</h2>
        <p>Lorem ipsum…</p>
        <h3 id="s111">Section one</h3>
        <p>Lorem ipsum…</p>
        <h1 id="p2">Part 2</h1>
        <p>Lorem ipsum…</p>
        <h2 id="c21">Chapter one</h2>
        <p>Lorem ipsum…</p>
        <h2 id="c22">Chapter two</h2>
        <p>Lorem ipsum…</p>
      </html>
    ),
  ]);

  t.deepEqual(
    await evaluate(R53, { device, document }),
    passes(document, "c22", "c21", "p2", "s111", "c11")
  );
});

test("evaluate() fails when the document headings are not properly structured", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <h1>Part one</h1>
        <h3 id="h3">Chapter one</h3>
        <h2 id="h2">Part two</h2>
        <h6 id="h6">Chapter one</h6>
      </html>
    ),
  ]);

  t.deepEqual(await evaluate(R53, { device, document }), [
    failed(R53, getById(document, "h6"), { 1: Outcomes.isNotStructured }),
    passed(R53, getById(document, "h2"), { 1: Outcomes.isStructured }),
    failed(R53, getById(document, "h3"), { 1: Outcomes.isNotStructured }),
  ]);
});

test("evaluate() is inapplicable when the document has only one heading", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <h1>Lone heading</h1>
      </html>
    ),
  ]);

  t.deepEqual(await evaluate(R53, { device, document }), [inapplicable(R53)]);
});
