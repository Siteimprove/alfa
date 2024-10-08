import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { Future } from "@siteimprove/alfa-future";
import { None } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import { Keyword, Percentage, RGB } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Style } from "@siteimprove/alfa-style";

import { Contrast as Diagnostic } from "../../dist/common/diagnostic/contrast.js";
import { Contrast as Outcomes } from "../../dist/common/outcome/contrast.js";
import R69 from "../../dist/sia-r69/rule.js";

import { evaluate } from "../common/evaluate.js";
import { cantTell, failed, inapplicable, passed } from "../common/outcome.js";

import { ColorError, ColorErrors } from "../../dist/common/dom/get-colors.js";
import { oracle } from "../common/oracle.js";

const rgb = (r: number, g: number, b: number, a: number = 1) =>
  RGB.of(
    Percentage.of(r),
    Percentage.of(g),
    Percentage.of(b),
    Percentage.of(a),
  );

test("evaluate() passes a text node that has sufficient contrast", async (t) => {
  const target = h.text("Hello world");

  const document = h.document([
    <html
      style={{
        backgroundColor: "black",
        color: "white",
      }}
    >
      {target}
    </html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target, {
      1: Outcomes.HasSufficientContrast(21, 4.5, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(1, 1, 1)],
          ["background", rgb(0, 0, 0)],
          21,
        ),
      ]),
    }),
  ]);
});

test("evaluate() correctly handles semi-transparent backgrounds", async (t) => {
  const target1 = h.text("Sufficient contrast");
  const target2 = h.text("Insufficient contrast");

  const document = h.document([
    <html
      style={{
        backgroundColor: "black",
        color: "white",
      }}
    >
      <div
        style={{
          backgroundColor: "rgb(100%, 100%, 100%, 15%)",
        }}
      >
        {target1}
      </div>
      <div
        style={{
          backgroundColor: "rgb(100%, 100%, 100%, 50%)",
        }}
      >
        {target2}
      </div>
    </html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target1, {
      1: Outcomes.HasSufficientContrast(15.08, 4.5, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(1, 1, 1)],
          ["background", rgb(0.15, 0.15, 0.15)],
          15.08,
        ),
      ]),
    }),
    failed(R69, target2, {
      1: Outcomes.HasInsufficientContrast(3.98, 4.5, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(1, 1, 1)],
          ["background", rgb(0.5, 0.5, 0.5)],
          3.98,
        ),
      ]),
    }),
  ]);
});

test("evaluate() correctly handles semi-transparent foregrounds", async (t) => {
  const target1 = h.text("Sufficient contrast");
  const target2 = h.text("Insufficient contrast");

  const document = h.document([
    <html
      style={{
        backgroundColor: "black",
      }}
    >
      <div
        style={{
          color: "rgb(100%, 100%, 100%, 85%)",
        }}
      >
        {target1}
      </div>
      <div
        style={{
          color: "rgb(100%, 100%, 100%, 40%)",
        }}
      >
        {target2}
      </div>
    </html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target1, {
      1: Outcomes.HasSufficientContrast(14.84, 4.5, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0.85, 0.85, 0.85)],
          ["background", rgb(0, 0, 0)],
          14.84,
        ),
      ]),
    }),
    failed(R69, target2, {
      1: Outcomes.HasInsufficientContrast(3.66, 4.5, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0.4, 0.4, 0.4)],
          ["background", rgb(0, 0, 0)],
          3.66,
        ),
      ]),
    }),
  ]);
});

test("evaluate() passes an 18pt text node with sufficient contrast", async (t) => {
  const target = h.text("Hello world");

  const document = h.document([
    <html
      style={{
        backgroundColor: "black",
        color: "#606060",
        fontSize: "18pt",
      }}
    >
      {target}
    </html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target, {
      1: Outcomes.HasSufficientContrast(3.34, 3, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0.3764706, 0.3764706, 0.3764706)],
          ["background", rgb(0, 0, 0)],
          3.34,
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
        Diagnostic.Pairing.of(
          ["foreground", rgb(0.3764706, 0.3764706, 0.3764706)],
          ["background", rgb(0, 0, 0)],
          3.34,
        ),
      ]),
    }),
  ]);
});

test("evaluate() passes a text node using the user agent default styles", async (t) => {
  const target = h.text("Hello world");

  const document = h.document([<html>{target}</html>]);

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target, {
      1: Outcomes.HasSufficientContrast(21, 4.5, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0, 0, 0)],
          ["background", rgb(1, 1, 1)],
          21,
        ),
      ]),
    }),
  ]);
});

test("evaluate() correctly resolves the `currentcolor` keyword", async (t) => {
  const target = h.text("Hello world");
  const document = h.document([
    <html
      style={{
        backgroundColor: "currentcolor",
        color: "white",
      }}
    >
      {target}
    </html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [
    failed(R69, target, {
      1: Outcomes.HasInsufficientContrast(1, 4.5, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(1, 1, 1)],
          ["background", rgb(1, 1, 1)],
          1,
        ),
      ]),
    }),
  ]);
});

test("evaluate() correctly resolves the `currentcolor` keyword to the user agent default", async (t) => {
  const target = h.text("Hello world");

  const document = h.document([
    <html
      style={{
        backgroundColor: "currentcolor",
      }}
    >
      {target}
    </html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [
    failed(R69, target, {
      1: Outcomes.HasInsufficientContrast(1, 4.5, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0, 0, 0)],
          ["background", rgb(0, 0, 0)],
          1,
        ),
      ]),
    }),
  ]);
});

test("evaluate() correctly handles circular `currentcolor` references", async (t) => {
  const target = h.text("Hello world");
  const color = "currentcolor";
  const html = (
    <html
      style={{
        color: color,
      }}
    >
      {target}
    </html>
  );

  const document = h.document([html]);

  const diagnostic = ColorErrors.of([
    ColorError.unresolvableForegroundColor(html, Keyword.of(color)),
  ]);

  t.deepEqual(await evaluate(R69, { document }), [
    cantTell(R69, target, diagnostic),
  ]);
});

test("evaluate() passes text nodes in widgets with good contrast", async (t) => {
  const target = h.text("Hello world");

  const document = h.document([
    <html>
      <button style={{ backgroundColor: "white" }}>{target}</button>
    </html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target, {
      1: Outcomes.HasSufficientContrast(21, 4.5, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0, 0, 0)],
          ["background", rgb(1, 1, 1)],
          21,
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

  t.deepEqual(await evaluate(R69, { document }), [inapplicable(R69)]);
});

test("evaluate() is inapplicable to text nodes in disabled groups", async (t) => {
  const document = h.document([
    <html>
      <fieldset disabled>
        <button>Hello world</button>
      </fieldset>
    </html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [inapplicable(R69)]);
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

  t.deepEqual(await evaluate(R69, { document }), [inapplicable(R69)]);
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

  t.deepEqual(await evaluate(R69, { document }), [inapplicable(R69)]);
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

  t.deepEqual(await evaluate(R69, { document }), [inapplicable(R69)]);
});

test("evaluate() is inapplicable to text that would otherwise pass if it was not only punctuation", async (t) => {
  const target = h.text(",./;'[]\\-=?<>:\"{}|_+!@#$%^&*()");

  const document = h.document([
    <html
      style={{
        backgroundColor: "black",
        color: "white",
      }}
    >
      {target}
    </html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [inapplicable(R69)]);
});

test("evaluate() is inapplicable to text that would otherwise fail if it was not only punctuation", async (t) => {
  const target = h.text(",./;'[]\\-=?<>:\"{}|_+!@#$%^&*()");

  const document = h.document([
    <html
      style={{
        backgroundImage: "linear-gradient(#000 50%, transparent 50%)",
        backgroundColor: "#000",
        color: "#000",
      }}
    >
      {target}
    </html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [inapplicable(R69)]);
});

test("evaluate() passes when a background color with sufficient contrast is input", async (t) => {
  const target = h.text("Hello world");

  const document = h.document([
    <html
      style={{
        backgroundImage: "url('foo.png')",
        color: "#000",
      }}
    >
      {target}
    </html>,
  ]);

  t.deepEqual(
    await evaluate(
      R69,
      { document },
      oracle({
        "background-colors": [rgb(1, 1, 1)],
      }),
    ),
    [
      passed(
        R69,
        target,
        {
          1: Outcomes.HasSufficientContrast(21, 4.5, [
            Diagnostic.Pairing.of(
              ["foreground", rgb(0, 0, 0)],
              ["background", rgb(1, 1, 1)],
              21,
            ),
          ]),
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() fails when a background color with insufficient contrast is input", async (t) => {
  const target = h.text("Hello world");

  const document = h.document([
    <html
      style={{
        backgroundImage: "url('foo.png')",
        color: "#000",
      }}
    >
      {target}
    </html>,
  ]);

  t.deepEqual(
    await evaluate(
      R69,
      { document },
      oracle({
        "background-colors": [rgb(0, 0, 0)],
      }),
    ),
    [
      failed(
        R69,
        target,
        {
          1: Outcomes.HasInsufficientContrast(1, 4.5, [
            Diagnostic.Pairing.of(
              ["foreground", rgb(0, 0, 0)],
              ["background", rgb(0, 0, 0)],
              1,
            ),
          ]),
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() passes when a linear gradient has sufficient contrast in the best case", async (t) => {
  const target = h.text("Hello world");

  const document = h.document([
    <html
      style={{
        backgroundImage: "linear-gradient(#fff 50%, transparent 50%)",
        backgroundColor: "#000",
        color: "#000",
      }}
    >
      {target}
    </html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target, {
      1: Outcomes.HasSufficientContrast(21, 4.5, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0, 0, 0)],
          ["background", rgb(1, 1, 1)],
          21,
        ),
        Diagnostic.Pairing.of(
          ["foreground", rgb(0, 0, 0)],
          ["background", rgb(0, 0, 0)],
          1,
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
        backgroundImage: "linear-gradient(#000 50%, transparent 50%)",
        backgroundColor: "#000",
        color: "#000",
      }}
    >
      {target}
    </html>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [
    failed(R69, target, {
      1: Outcomes.HasInsufficientContrast(1, 4.5, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0, 0, 0)],
          ["background", rgb(0, 0, 0)],
          1,
        ),
        Diagnostic.Pairing.of(
          ["foreground", rgb(0, 0, 0)],
          ["background", rgb(0, 0, 0)],
          1,
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
        backgroundColor: "rgba(0 0 0 / 0.75)",
        color: "#fff",
      }}
    >
      {target}
    </div>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target, {
      1: Outcomes.HasSufficientContrast(10.41, 4.5, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(1, 1, 1)],
          ["background", rgb(0.25, 0.25, 0.25)],
          10.41,
        ),
      ]),
    }),
  ]);
});

test(`evaluate() cannot tell when a background has a fixed size`, async (t) => {
  const target = h.text("Hello World");

  const div = (
    <div
      style={{
        backgroundImage:
          "linear-gradient(to right,rgb(0, 0, 0) 0%, rgb(0, 0, 0) 100%)",
        backgroundRepeat: "repeat-x",
        backgroundPosition: "0px 100%",
        backgroundSize: "100% 2px",
      }}
    >
      {target}
    </div>
  );
  const document = h.document([div]);

  const backgroundSize = Style.from(div, Device.standard()).computed(
    "background-size",
  ).value;

  const diagnostic = ColorErrors.of([
    ColorError.backgroundSize(div, backgroundSize),
  ]);

  t.deepEqual(await evaluate(R69, { document }), [
    cantTell(R69, target, diagnostic),
  ]);
});

test(`evaluate() cannot tell when encountering a text shadow`, async (t) => {
  const target = h.text("Hello World");
  const div = <div style={{ textShadow: "1px 1px" }}>{target}</div>;
  const document = h.document([div]);

  const textShadow = Style.from(div, Device.standard()).computed(
    "text-shadow",
  ).value;
  const diagnostic = ColorErrors.of([ColorError.textShadow(div, textShadow)]);

  t.deepEqual(await evaluate(R69, { document }), [
    cantTell(R69, target, diagnostic),
  ]);
});

test(`evaluate() cannot tell when encountering a non-ignored interposed
      ancestor's sibling before encountering an opaque background`, async (t) => {
  const target = h.text("Hello World");
  const interposed = (
    <span
      style={{
        position: "absolute",
        backgroundColor: "red",
        width: "100%",
        height: "100%",
      }}
    />
  );

  const body = (
    <body>
      {interposed}
      {target}
    </body>
  );

  const document = h.document([body]);

  // Ask if it should be ignored
  t.deepEqual(await evaluate(R69, { document }), [cantTell(R69, target)]);

  const diagnostic = ColorErrors.of([
    ColorError.interposedDescendants(body, [interposed]),
  ]);

  // It shouldn't be ignored, ask for color.
  t.deepEqual(
    await evaluate(
      R69,
      { document },
      oracle({ "ignored-interposed-elements": [] }),
    ),
    [cantTell(R69, target, diagnostic, Outcome.Mode.SemiAuto)],
  );

  // It should be ignored, resolve automatically.
  t.deepEqual(
    await evaluate(
      R69,
      { document },
      oracle({ "ignored-interposed-elements": [interposed] }),
    ),
    [
      passed(
        R69,
        target,
        {
          1: Outcomes.HasSufficientContrast(21, 4.5, [
            Diagnostic.Pairing.of(
              ["foreground", rgb(0, 0, 0)],
              ["background", rgb(1, 1, 1)],
              21,
            ),
          ]),
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test(`evaluate() ignores transparent interposed element before
      encountering an opaque background`, async (t) => {
  const target = h.text("Hello World");
  const interposed = (
    <span
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
      }}
    />
  );
  const div = (
    <div
      style={{
        position: "relative",
        backgroundColor: "#fff",
      }}
    >
      {interposed}
      {target}
    </div>
  );
  const document = h.document([<body>{div}</body>]);

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target, {
      1: Outcomes.HasSufficientContrast(21, 4.5, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0, 0, 0)],
          ["background", rgb(1, 1, 1)],
          21,
        ),
      ]),
    }),
  ]);
});

test(`evaluate() does not consider ancestors as interposed elements`, async (t) => {
  const target1 = h.text("Hello World");
  const target2 = h.text("Lorem ipsum");
  const interposed = (
    <div
      style={{
        background: "url('foo.jpg')",
        position: "absolute",
        width: "100%",
        height: "100%",
      }}
    >
      {target1}
    </div>
  );

  // interposed is interposed inside the <body>.
  // target1 is inside interposed, therefore it does not consider it as an
  // "interposed element", but as an absolutely positioned ancestor.
  // target2 is outside interposed and considers it as an "interposed element",
  // it may be interposed between the offset parent (body) and itself.
  const body = (
    <body>
      {interposed}
      {target2}
    </body>
  );

  const document = h.document([body]);

  await evaluate(R69, { document }, (_, question) => {
    let expected = "Unexpected question";
    if (question.context === target1) {
      expected = "background-colors";
    }

    if (question.context === target2) {
      expected = "ignored-interposed-elements";
    }

    t.deepEqual(question.uri, expected);
    return Future.now(None);
  });
});

test(`evaluate() ignore interposed descendants if it can resolve colors
      before seeing any`, async (t) => {
  const target = h.text("Hello World");
  const div = <div style={{ backgroundColor: "yellow" }}>{target}</div>;
  const interposed = (
    <div
      style={{
        position: "absolute",
        backgroundColor: "red",
        width: "100%",
        height: "100%",
      }}
    ></div>
  );

  // target is inside the div with solid color, so it doesn't care about the
  // interposed element and can fully resolve its colors before encountering it.
  const body = (
    <body>
      {interposed}
      {div}
    </body>
  );

  const document = h.document([body]);

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target, {
      1: Outcomes.HasSufficientContrast(19.56, 4.5, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0, 0, 0)],
          ["background", rgb(1, 1, 0)],
          19.56,
        ),
      ]),
    }),
  ]);
});

test(`evaluate() cannot tell when encountering an absolutely positioned parent
      before encountering an opaque background`, async (t) => {
  {
    const target = h.text("Hello World");
    const div = (
      <div
        style={{
          position: "absolute",
        }}
      >
        {target}
      </div>
    );
    const document = h.document([div]);

    const diagnostic = ColorErrors.of([
      ColorError.nonStaticPosition(div, Keyword.of("absolute")),
    ]);

    t.deepEqual(await evaluate(R69, { document }), [
      cantTell(R69, target, diagnostic),
    ]);
  }
});

test("evaluate() can tell when encountering an opaque background before an absolutely positioned parent", async (t) => {
  const target = h.text("Hello World");

  const document = h.document([
    <div
      style={{
        position: "absolute",
        backgroundColor: "#fff",
      }}
    >
      {target}
    </div>,
  ]);

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target, {
      1: Outcomes.HasSufficientContrast(21, 4.5, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0, 0, 0)],
          ["background", rgb(1, 1, 1)],
          21,
        ),
      ]),
    }),
  ]);
});

test("evaluate() can tell when interposed descendant overlaps offset parent, but does not overlap target", async (t) => {
  const target = h.text("Hello World");
  const device = Device.standard();

  const document = h.document([
    <body box={{ device, x: 8, y: 8, width: 1070, height: 126 }}>
      <div
        style={{
          position: "absolute",
          backgroundColor: "green",
          opacity: "50%",
          top: "100px",
          left: "100px",
          width: "100px",
          height: "100px",
        }}
        box={{ device, x: 100, y: 100, width: 100, height: 100 }}
      ></div>
      <div box={{ device, x: 8, y: 8, width: 1070, height: 18 }}>{target}</div>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
    </body>,
  ]);

  t.deepEqual(await evaluate(R69, { document, device }), [
    passed(R69, target, {
      1: Outcomes.HasSufficientContrast(21, 4.5, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0, 0, 0)],
          ["background", rgb(1, 1, 1)],
          21,
        ),
      ]),
    }),
  ]);
});

test("evaluate() is inapplicable to `aria-disabled` `<a>` elements without `href`", async (t) => {
  const document = h.document([<a aria-disabled="true">X</a>]);

  t.deepEqual(await evaluate(R69, { document }), [inapplicable(R69)]);
});

test("evaluate() is applicable to  `<a>` elements without `href`", async (t) => {
  const target = h.text("X");
  const document = h.document([<a>{target}</a>]);

  t.deepEqual(await evaluate(R69, { document }), [
    passed(R69, target, {
      1: Outcomes.HasSufficientContrast(21, 4.5, [
        Diagnostic.Pairing.of(
          ["foreground", rgb(0, 0, 0)],
          ["background", rgb(1, 1, 1)],
          21,
        ),
      ]),
    }),
  ]);
});
