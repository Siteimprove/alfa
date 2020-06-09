import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { RGB, Percentage } from "@siteimprove/alfa-css";
import { Document, Element, Text } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";

import R69, { Outcomes } from "../../src/sia-r69/rule";
import { Contrast } from "../../src/sia-r69/diagnostic/contrast";

import { evaluate } from "../common/evaluate";
import { passed, failed, cantTell, inapplicable } from "../common/outcome";

const rgb = (r: number, g: number, b: number, a: number = 1) =>
  RGB.of(
    Percentage.of(r),
    Percentage.of(g),
    Percentage.of(b),
    Percentage.of(a)
  );

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
      1: Outcomes.HasSufficientContrast(21, 4.5, [
        Contrast.Pairing.of(rgb(1, 1, 1), rgb(0, 0, 0), 21),
      ]),
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
      1: Outcomes.HasSufficientContrast(15.08, 4.5, [
        Contrast.Pairing.of(rgb(1, 1, 1), rgb(0.15, 0.15, 0.15), 15.08),
      ]),
    }),
    failed(R69, insufficient, {
      1: Outcomes.HasInsufficientContrast(3.98, 4.5, [
        Contrast.Pairing.of(rgb(1, 1, 1), rgb(0.5, 0.5, 0.5), 3.98),
      ]),
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
      1: Outcomes.HasSufficientContrast(14.84, 4.5, [
        Contrast.Pairing.of(rgb(0.85, 0.85, 0.85), rgb(0, 0, 0), 14.84),
      ]),
    }),
    failed(R69, insufficient, {
      1: Outcomes.HasInsufficientContrast(3.66, 4.5, [
        Contrast.Pairing.of(rgb(0.4, 0.4, 0.4), rgb(0, 0, 0), 3.66),
      ]),
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
      1: Outcomes.HasSufficientContrast(3.34, 3, [
        Contrast.Pairing.of(
          rgb(0.3764706, 0.3764706, 0.3764706),
          rgb(0, 0, 0),
          3.34
        ),
      ]),
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
      1: Outcomes.HasSufficientContrast(3.34, 3, [
        Contrast.Pairing.of(
          rgb(0.3764706, 0.3764706, 0.3764706),
          rgb(0, 0, 0),
          3.34
        ),
      ]),
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
      1: Outcomes.HasSufficientContrast(21, 4.5, [
        Contrast.Pairing.of(rgb(0, 0, 0), rgb(1, 1, 1), 21),
      ]),
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
      1: Outcomes.HasInsufficientContrast(1, 4.5, [
        Contrast.Pairing.of(rgb(1, 1, 1), rgb(1, 1, 1), 1),
      ]),
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
      1: Outcomes.HasInsufficientContrast(1, 4.5, [
        Contrast.Pairing.of(rgb(0, 0, 0), rgb(0, 0, 0), 1),
      ]),
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
