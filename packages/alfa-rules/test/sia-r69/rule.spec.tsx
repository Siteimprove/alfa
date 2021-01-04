import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { RGB, Percentage } from "@siteimprove/alfa-css";
import { Document, Text } from "@siteimprove/alfa-dom";

import R69, { Outcomes } from "../../src/sia-r69/rule";
import { Contrast } from "../../src/sia-r69/diagnostic/contrast";

import { evaluate } from "../common/evaluate";
import { passed, failed, cantTell, inapplicable } from "../common/outcome";

import { oracle } from "../common/oracle";

const rgb = (r: number, g: number, b: number, a: number = 1) =>
  RGB.of(
    Percentage.of(r),
    Percentage.of(g),
    Percentage.of(b),
    Percentage.of(a)
  );

test("evaluate() passes a text node that has sufficient contrast", async (t) => {
  const target = Text.of("Hello world");

  const document = Document.of([
    <html style={{ backgroundColor: "black", color: "white" }}>{target}</html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target, {
      1: Outcomes.HasSufficientContrast(21, 4.5, [
        Contrast.Pairing.of(rgb(1, 1, 1), rgb(0, 0, 0), 21),
      ]),
    }),
  ]);
});

test("evaluate() correctly handles semi-transparent backgrounds", async (t) => {
  const target1 = Text.of("Sufficient contrast");
  const target2 = Text.of("Insufficient contrast");

  const document = Document.of([
    <html style={{ backgroundColor: "black", color: "white" }}>
      <div style={{ backgroundColor: "rgb(100%, 100%, 100%, 15%)" }}>
        {target1}
      </div>
      <div style={{ backgroundColor: "rgb(100%, 100%, 100%, 50%)" }}>
        {target2}
      </div>
    </html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target1, {
      1: Outcomes.HasSufficientContrast(15.08, 4.5, [
        Contrast.Pairing.of(rgb(1, 1, 1), rgb(0.15, 0.15, 0.15), 15.08),
      ]),
    }),
    failed(R69, target2, {
      1: Outcomes.HasInsufficientContrast(3.98, 4.5, [
        Contrast.Pairing.of(rgb(1, 1, 1), rgb(0.5, 0.5, 0.5), 3.98),
      ]),
    }),
  ]);
});

test("evaluate() correctly handles semi-transparent foregrounds", async (t) => {
  const target1 = Text.of("Sufficient contrast");
  const target2 = Text.of("Insufficient contrast");

  const document = Document.of([
    <html style={{ backgroundColor: "black" }}>
      <div style={{ color: "rgb(100%, 100%, 100%, 85%)" }}>{target1}</div>
      <div style={{ color: "rgb(100%, 100%, 100%, 40%)" }}>{target2}</div>
    </html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target1, {
      1: Outcomes.HasSufficientContrast(14.84, 4.5, [
        Contrast.Pairing.of(rgb(0.85, 0.85, 0.85), rgb(0, 0, 0), 14.84),
      ]),
    }),
    failed(R69, target2, {
      1: Outcomes.HasInsufficientContrast(3.66, 4.5, [
        Contrast.Pairing.of(rgb(0.4, 0.4, 0.4), rgb(0, 0, 0), 3.66),
      ]),
    }),
  ]);
});

test("evaluate() passes an 18pt text node with sufficient contrast", async (t) => {
  const target = Text.of("Hello world");

  const document = Document.of([
    <html
      style={{ backgroundColor: "black", color: "#606060", fontSize: "18pt" }}
    >
      {target}
    </html>,
  ]);

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
  const target = Text.of("Hello world");

  const document = Document.of([
    <html
      style={{
        backgroundColor: "black",
        color: "#606060",
        fontSize: "14pt",
        fontWeight: "bold",
      }}
    >
      {target}
    </html>,
  ]);

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
  const target = Text.of("Hello world");

  const document = Document.of([<html>{target}</html>]);

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target, {
      1: Outcomes.HasSufficientContrast(21, 4.5, [
        Contrast.Pairing.of(rgb(0, 0, 0), rgb(1, 1, 1), 21),
      ]),
    }),
  ]);
});

test("evaluate() correctly resolves the `currentcolor` keyword", async (t) => {
  const target = Text.of("Hello world");

  const document = Document.of([
    <html style={{ backgroundColor: "currentcolor", color: "white" }}>
      {target}
    </html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [
    failed(R69, target, {
      1: Outcomes.HasInsufficientContrast(1, 4.5, [
        Contrast.Pairing.of(rgb(1, 1, 1), rgb(1, 1, 1), 1),
      ]),
    }),
  ]);
});

test("evaluate() correctly resolves the `currentcolor` keyword to the user agent default", async (t) => {
  const target = Text.of("Hello world");

  const document = Document.of([
    <html style={{ backgroundColor: "currentcolor" }}>{target}</html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [
    failed(R69, target, {
      1: Outcomes.HasInsufficientContrast(1, 4.5, [
        Contrast.Pairing.of(rgb(0, 0, 0), rgb(0, 0, 0), 1),
      ]),
    }),
  ]);
});

test("evaluate() correctly handles circular `currentcolor` references", async (t) => {
  const target = Text.of("Hello world");

  const document = Document.of([
    <html style={{ color: "currentcolor" }}>{target}</html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [cantTell(R69, target)]);
});

test("evaluate() is inapplicable to text nodes in widgets", async (t) => {
  const document = Document.of([
    <html>
      <button>Hello world</button>
    </html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [inapplicable(R69)]);
});

test("evaluate() is inapplicable to text nodes in disabled groups", async (t) => {
  const document = Document.of([
    <html>
      <fieldset disabled>
        <button>Hello world</button>
      </fieldset>
    </html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [inapplicable(R69)]);
});

test("evaluate() passes when a background color with sufficient contrast is input", async (t) => {
  const target = Text.of("Hello world");

  const document = Document.of([
    <html style={{ color: "#000", backgroundImage: "url('foo.png')" }}>
      {target}
    </html>,
  ]);

  t.deepEqual(
    await evaluate(
      R69,
      { document },
      oracle({
        "background-colors": [rgb(1, 1, 1)],
      })
    ),
    [
      passed(R69, target, {
        1: Outcomes.HasSufficientContrast(21, 4.5, [
          Contrast.Pairing.of(rgb(0, 0, 0), rgb(1, 1, 1), 21),
        ]),
      }),
    ]
  );
});

test("evaluate() fails when a background color with insufficient contrast is input", async (t) => {
  const target = Text.of("Hello world");

  const document = Document.of([
    <html style={{ color: "#000", backgroundImage: "url('foo.png')" }}>
      {target}
    </html>,
  ]);

  t.deepEqual(
    await evaluate(
      R69,
      { document },
      oracle({
        "background-colors": [rgb(0, 0, 0)],
      })
    ),
    [
      failed(R69, target, {
        1: Outcomes.HasInsufficientContrast(1, 4.5, [
          Contrast.Pairing.of(rgb(0, 0, 0), rgb(0, 0, 0), 1),
        ]),
      }),
    ]
  );
});

test("evaluate() passes when a linear gradient has sufficient contrast in the best case", async (t) => {
  const target = Text.of("Hello world");

  const document = Document.of([
    <html
      style={{
        color: "#000",
        backgroundImage: "linear-gradient(#fff 50%, transparent 50%)",
        backgroundColor: "#000",
      }}
    >
      {target}
    </html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target, {
      1: Outcomes.HasSufficientContrast(21, 4.5, [
        Contrast.Pairing.of(rgb(0, 0, 0), rgb(1, 1, 1), 21),
        Contrast.Pairing.of(rgb(0, 0, 0), rgb(0, 0, 0), 1),
      ]),
    }),
  ]);
});

test("evaluate() fails when a linear gradient has insufficient contrast in the best case", async (t) => {
  const target = Text.of("Hello world");

  const document = Document.of([
    <html
      style={{
        color: "#000",
        backgroundImage: "linear-gradient(#000 50%, transparent 50%)",
        backgroundColor: "#000",
      }}
    >
      {target}
    </html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [
    failed(R69, target, {
      1: Outcomes.HasInsufficientContrast(1, 4.5, [
        Contrast.Pairing.of(rgb(0, 0, 0), rgb(0, 0, 0), 1),
        Contrast.Pairing.of(rgb(0, 0, 0), rgb(0, 0, 0), 1),
      ]),
    }),
  ]);
});

test(`evaluate() correctly merges semi-transparent background layers against a
      white backdrop`, async (t) => {
  const target = Text.of("Hello world");

  const document = Document.of([
    <div
      style={{
        color: "#fff",
        backgroundColor: "rgba(0 0 0 / 0.75)",
      }}
    >
      {target}
    </div>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target, {
      1: Outcomes.HasSufficientContrast(10.41, 4.5, [
        Contrast.Pairing.of(rgb(1, 1, 1), rgb(0.25, 0.25, 0.25), 10.41),
      ]),
    }),
  ]);
});
