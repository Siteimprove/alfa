import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element, Text } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";

import R69, { Outcomes } from "../../src/sia-r69/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, cantTell, inapplicable } from "../common/outcome";

test("evaluate() passes a text node that has sufficient contrast", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html style="background-color: black; color: white">Hello world</html>,
      Option.of(self)
    ),
  ]);

  const target = document.descendants().find(Text.isText).get();

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target, {
      1: Outcomes.HasSufficientContrast,
    }),
  ]);
});

test("evaluate() correctly handles semi-transparent backgrounds", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html style="background-color: black; color: white">
        <div style="background-color: rgb(100%, 100%, 100%, 15%)">
          Sufficient contrast
        </div>
        <div style="background-color: rgb(100%, 100%, 100%, 50%)">
          Insufficient contrast
        </div>
      </html>,
      Option.of(self)
    ),
  ]);

  const [sufficient, insufficient] = document.descendants().filter(Text.isText);

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, sufficient, {
      1: Outcomes.HasSufficientContrast,
    }),
    failed(R69, insufficient, {
      1: Outcomes.HasInsufficientContrast,
    }),
  ]);
});

test("evaluate() correctly handles semi-transparent foregrounds", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html style="background-color: black">
        <div style="color: rgb(100%, 100%, 100%, 85%)">Sufficient contrast</div>
        <div style="color: rgb(100%, 100%, 100%, 40%)">
          Insufficient contrast
        </div>
      </html>,
      Option.of(self)
    ),
  ]);

  const [sufficient, insufficient] = document.descendants().filter(Text.isText);

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, sufficient, {
      1: Outcomes.HasSufficientContrast,
    }),
    failed(R69, insufficient, {
      1: Outcomes.HasInsufficientContrast,
    }),
  ]);
});

test("evaluate() passes an 18pt text node with sufficient contrast", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html style="background-color: black; color: #606060; font-size: 18pt">
        Hello world
      </html>,
      Option.of(self)
    ),
  ]);

  const target = document.descendants().find(Text.isText).get();

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target, {
      1: Outcomes.HasSufficientContrast,
    }),
  ]);
});

test("evaluate() passes an 14pt, bold text node with sufficient contrast", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html style="background-color: black; color: #606060; font-size: 14pt; font-weight: bold">
        Hello world
      </html>,
      Option.of(self)
    ),
  ]);

  const target = document.descendants().find(Text.isText).get();

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target, {
      1: Outcomes.HasSufficientContrast,
    }),
  ]);
});

test("evaluate() passes a text node using the user agent default styles", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(<html>Hello world</html>, Option.of(self)),
  ]);

  const target = document.descendants().find(Text.isText).get();

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target, {
      1: Outcomes.HasSufficientContrast,
    }),
  ]);
});

test("evaluate() correctly resolves the `currentcolor` keyword", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html style="background-color: currentcolor; color: white">
        Hello world
      </html>,
      Option.of(self)
    ),
  ]);

  const target = document.descendants().find(Text.isText).get();

  t.deepEqual(await evaluate(R69, { document }), [
    failed(R69, target, {
      1: Outcomes.HasInsufficientContrast,
    }),
  ]);
});

test("evaluate() correctly resolves the `currentcolor` keyword to the user agent default", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html style="background-color: currentcolor">Hello world</html>,
      Option.of(self)
    ),
  ]);

  const target = document.descendants().find(Text.isText).get();

  t.deepEqual(await evaluate(R69, { document }), [
    failed(R69, target, {
      1: Outcomes.HasInsufficientContrast,
    }),
  ]);
});

test("evaluate() correctly handles circular `currentcolor` references", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html style="color: currentcolor">Hello world</html>,
      Option.of(self)
    ),
  ]);

  const target = document.descendants().find(Text.isText).get();

  t.deepEqual(await evaluate(R69, { document }), [cantTell(R69, target)]);
});

test("evaluate() is inapplicable to text nodes in widgets", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <button>Hello world</button>
      </html>,
      Option.of(self)
    ),
  ]);

  t.deepEqual(await evaluate(R69, { document }), [inapplicable(R69)]);
});

test("evaluate() is inapplicable to text nodes in disabled groups", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <fieldset disabled>
          <button>Hello world</button>
        </fieldset>
      </html>,
      Option.of(self)
    ),
  ]);

  t.deepEqual(await evaluate(R69, { document }), [inapplicable(R69)]);
});
