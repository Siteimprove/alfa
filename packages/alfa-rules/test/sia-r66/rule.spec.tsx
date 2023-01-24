import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { RGB, Percentage, Keyword } from "@siteimprove/alfa-css";

import R66 from "../../src/sia-r66/rule";
import { Contrast as Diagnostic } from "../../src/common/diagnostic/contrast";
import { Contrast as Outcomes } from "../../src/common/outcome/contrast";

import { evaluate } from "../common/evaluate";
import { passed, failed, cantTell, inapplicable } from "../common/outcome";

import { oracle } from "../common/oracle";
import { ColorError, ColorErrors } from "../../src/common/dom/get-colors";

const rgb = (r: number, g: number, b: number, a: number = 1) =>
  RGB.of(
    Percentage.of(r),
    Percentage.of(g),
    Percentage.of(b),
    Percentage.of(a)
  );

test("evaluate() passes a text node that has sufficient contrast", async (t) => {
  const target = h.text("Hello world");

  const document = h.document([
    <html style={{ backgroundColor: "black", color: "white" }}>{target}</html>,
  ]);

  t.deepEqual(await evaluate(R66, { document }), [
    passed(R66, target, {
      1: Outcomes.HasSufficientContrast(21, 7, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(1, 1, 1)],
          ["background", rgb(0, 0, 0)],
          21
        ),
      ]),
    }),
  ]);
});

test("evaluate() correctly handles semi-transparent backgrounds", async (t) => {
  const target1 = h.text("Sufficient contrast");
  const target2 = h.text("Insufficient contrast");

  const document = h.document([
    <html style={{ backgroundColor: "black", color: "white" }}>
      <div style={{ backgroundColor: "rgb(100%, 100%, 100%, 15%)" }}>
        {target1}
      </div>
      <div style={{ backgroundColor: "rgb(100%, 100%, 100%, 40%)" }}>
        {target2}
      </div>
    </html>,
  ]);

  t.deepEqual(await evaluate(R66, { document }), [
    passed(R66, target1, {
      1: Outcomes.HasSufficientContrast(15.08, 7, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(1, 1, 1)],
          ["background", rgb(0.15, 0.15, 0.15)],
          15.08
        ),
      ]),
    }),
    failed(R66, target2, {
      1: Outcomes.HasInsufficientContrast(5.74, 7, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(1, 1, 1)],
          ["background", rgb(0.4, 0.4, 0.4)],
          5.74
        ),
      ]),
    }),
  ]);
});

test("evaluate() correctly handles semi-transparent foregrounds", async (t) => {
  const target1 = h.text("Sufficient contrast");
  const target2 = h.text("Insufficient contrast");

  const document = h.document([
    <html style={{ backgroundColor: "black" }}>
      <div style={{ color: "rgb(100%, 100%, 100%, 85%)" }}>{target1}</div>
      <div style={{ color: "rgb(100%, 100%, 100%, 50%)" }}>{target2}</div>
    </html>,
  ]);

  t.deepEqual(await evaluate(R66, { document }), [
    passed(R66, target1, {
      1: Outcomes.HasSufficientContrast(14.84, 7, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0.85, 0.85, 0.85)],
          ["background", rgb(0, 0, 0)],
          14.84
        ),
      ]),
    }),
    failed(R66, target2, {
      1: Outcomes.HasInsufficientContrast(5.28, 7, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0.5, 0.5, 0.5)],
          ["background", rgb(0, 0, 0)],
          5.28
        ),
      ]),
    }),
  ]);
});

test("evaluate() passes an 18pt text node with sufficient contrast", async (t) => {
  const target = h.text("Hello world");

  const document = h.document([
    <html
      style={{ backgroundColor: "black", color: "#808080", fontSize: "18pt" }}
    >
      {target}
    </html>,
  ]);

  t.deepEqual(await evaluate(R66, { document }), [
    passed(R66, target, {
      1: Outcomes.HasSufficientContrast(5.32, 4.5, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0.5019608, 0.5019608, 0.5019608)],
          ["background", rgb(0, 0, 0)],
          5.32
        ),
      ]),
    }),
  ]);
});

test("evaluate() passes an 14pt, bold text node with sufficient contrast", async (t) => {
  const target = h.text("Hello world");

  const document = h.document([
    <html
      style={{
        backgroundColor: "black",
        color: "#808080",
        fontSize: "14pt",
        fontWeight: "bold",
      }}
    >
      {target}
    </html>,
  ]);

  t.deepEqual(await evaluate(R66, { document }), [
    passed(R66, target, {
      1: Outcomes.HasSufficientContrast(5.32, 4.5, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0.5019608, 0.5019608, 0.5019608)],
          ["background", rgb(0, 0, 0)],
          5.32
        ),
      ]),
    }),
  ]);
});

test("evaluate() passes a text node using the user agent default styles", async (t) => {
  const target = h.text("Hello world");

  const document = h.document([<html>{target}</html>]);

  t.deepEqual(await evaluate(R66, { document }), [
    passed(R66, target, {
      1: Outcomes.HasSufficientContrast(21, 7, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0, 0, 0)],
          ["background", rgb(1, 1, 1)],
          21
        ),
      ]),
    }),
  ]);
});

test("evaluate() correctly resolves the `currentcolor` keyword", async (t) => {
  const target = h.text("Hello world");

  const document = h.document([
    <html style={{ backgroundColor: "currentcolor", color: "white" }}>
      {target}
    </html>,
  ]);

  t.deepEqual(await evaluate(R66, { document }), [
    failed(R66, target, {
      1: Outcomes.HasInsufficientContrast(1, 7, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(1, 1, 1)],
          ["background", rgb(1, 1, 1)],
          1
        ),
      ]),
    }),
  ]);
});

test("evaluate() correctly resolves the `currentcolor` keyword to the user agent default", async (t) => {
  const target = h.text("Hello world");

  const document = h.document([
    <html style={{ backgroundColor: "currentcolor" }}>{target}</html>,
  ]);

  t.deepEqual(await evaluate(R66, { document }), [
    failed(R66, target, {
      1: Outcomes.HasInsufficientContrast(1, 7, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0, 0, 0)],
          ["background", rgb(0, 0, 0)],
          1
        ),
      ]),
    }),
  ]);
});

test("evaluate() correctly handles circular `currentcolor` references", async (t) => {
  const target = h.text("Hello world");
  const color = "currentcolor";
  const html = <html style={{ color: color }}>{target}</html>;

  const document = h.document([html]);
  const diagnostic = ColorErrors.of([
    ColorError.unresolvableForegroundColor(html, Keyword.of(color)),
  ]);

  t.deepEqual(await evaluate(R66, { document }), [
    cantTell(R66, target, diagnostic),
  ]);
});

test("evaluate() passes text nodes in widgets with good contrast", async (t) => {
  const target = h.text("Hello world");

  const document = h.document([
    <html>
      <button>{target}</button>
    </html>,
  ]);

  t.deepEqual(await evaluate(R66, { document }), [
    passed(R66, target, {
      1: Outcomes.HasSufficientContrast(21, 7, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0, 0, 0)],
          ["background", rgb(1, 1, 1)],
          21
        ),
      ]),
    }),
  ]);
});

test("evaluate() is inapplicable to text nodes in disabled widgets", async (t) => {
  const document = h.document([
    <html>
      <button disabled>Hello world</button>
      <button aria-disabled="true">Hello world</button>
    </html>,
  ]);

  t.deepEqual(await evaluate(R66, { document }), [inapplicable(R66)]);
});

test("evaluate() is inapplicable to text nodes in disabled groups", async (t) => {
  const document = h.document([
    <html>
      <fieldset disabled>
        <button>Hello world</button>
      </fieldset>
    </html>,
  ]);

  t.deepEqual(await evaluate(R66, { document }), [inapplicable(R66)]);
});

test("evaluate() is inapplicable to elements that are used in name of disabled widgets", async (t) => {
  const document = h.document([
    <html>
      <fieldset aria-labelledby="label" disabled>
        <button>Hello world</button>
      </fieldset>
      <div id="label">widget name</div>
    </html>,
  ]);

  t.deepEqual(await evaluate(R66, { document }), [inapplicable(R66)]);
});

test(`evaluate() is inapplicable to the text that is part of a label of a disabled widget
      and the label is the label for an input with type="text"`, async (t) => {
  const document = h.document([
    <html>
      <label style={{ color: "#888", background: "white" }}>
        My name
        <input type="text" disabled />
      </label>
    </html>,
  ]);

  t.deepEqual(await evaluate(R66, { document }), [inapplicable(R66)]);
});

test(`evaluate() is inapplicable to the text that is part of a label of a disabled widget
      and the label is the label for an input in a div with role="group" and aria-disabled="true" attribute`, async (t) => {
  const document = h.document([
    <html>
      <div
        role="group"
        aria-disabled="true"
        style={{ color: "#888", background: "white" }}
      >
        <label>
          My name
          <input />
        </label>
      </div>
    </html>,
  ]);

  t.deepEqual(await evaluate(R66, { document }), [inapplicable(R66)]);
});

test("evaluate() passes when a background color with sufficient contrast is input", async (t) => {
  const target = h.text("Hello world");

  const document = h.document([
    <html style={{ color: "#000", backgroundImage: "url('foo.png')" }}>
      {target}
    </html>,
  ]);

  t.deepEqual(
    await evaluate(
      R66,
      { document },
      oracle({
        "background-colors": [rgb(1, 1, 1)],
      })
    ),
    [
      passed(
        R66,
        target,
        {
          1: Outcomes.HasSufficientContrast(21, 7, [
            Diagnostic.Pairing.of(
              ["foreground", rgb(0, 0, 0)],
              ["background", rgb(1, 1, 1)],
              21
            ),
          ]),
        },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test("evaluate() fails when a background color with insufficient contrast is input", async (t) => {
  const target = h.text("Hello world");

  const document = h.document([
    <html style={{ color: "#000", backgroundImage: "url('foo.png')" }}>
      {target}
    </html>,
  ]);

  t.deepEqual(
    await evaluate(
      R66,
      { document },
      oracle({
        "background-colors": [rgb(0, 0, 0)],
      })
    ),
    [
      failed(
        R66,
        target,
        {
          1: Outcomes.HasInsufficientContrast(1, 7, [
            Diagnostic.Pairing.of(
              ["foreground", rgb(0, 0, 0)],
              ["background", rgb(0, 0, 0)],
              1
            ),
          ]),
        },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test("evaluate() passes when a linear gradient has sufficient contrast in the best case", async (t) => {
  const target = h.text("Hello world");

  const document = h.document([
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

  t.deepEqual(await evaluate(R66, { document }), [
    passed(R66, target, {
      1: Outcomes.HasSufficientContrast(21, 7, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0, 0, 0)],
          ["background", rgb(1, 1, 1)],
          21
        ),
        Diagnostic.Pairing.of(
          ["foreground", rgb(0, 0, 0)],
          ["background", rgb(0, 0, 0)],
          1
        ),
      ]),
    }),
  ]);
});

test("evaluate() fails when a linear gradient has insufficient contrast in the best case", async (t) => {
  const target = h.text("Hello world");

  const document = h.document([
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

  t.deepEqual(await evaluate(R66, { document }), [
    failed(R66, target, {
      1: Outcomes.HasInsufficientContrast(1, 7, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0, 0, 0)],
          ["background", rgb(0, 0, 0)],
          1
        ),
        Diagnostic.Pairing.of(
          ["foreground", rgb(0, 0, 0)],
          ["background", rgb(0, 0, 0)],
          1
        ),
      ]),
    }),
  ]);
});

test(`evaluate() correctly merges semi-transparent background layers against a
      white backdrop`, async (t) => {
  const target = h.text("Hello world");

  const document = h.document([
    <div
      style={{
        color: "#fff",
        backgroundColor: "rgba(0 0 0 / 0.75)",
      }}
    >
      {target}
    </div>,
  ]);

  t.deepEqual(await evaluate(R66, { document }), [
    passed(R66, target, {
      1: Outcomes.HasSufficientContrast(10.41, 7, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(1, 1, 1)],
          ["background", rgb(0.25, 0.25, 0.25)],
          10.41
        ),
      ]),
    }),
  ]);
});
