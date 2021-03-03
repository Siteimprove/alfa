import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R83, { Outcomes } from "../../src/sia-r83/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a text node that truncates overflow using ellipsis", async (t) => {
  const target = h.text("Hello world");

  const document = Document.of(
    [<div>{target}</div>],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R83, { document }), [
    passed(R83, target, {
      1: Outcomes.WrapsText,
    }),
  ]);
});

test(`evaluate() passes a child text node of an element whose parent truncates
      overflow using ellipsis`, async (t) => {
  const target = h.text("Hello world");

  const document = Document.of(
    [
      <div>
        <span>{target}</span>
      </div>,
    ],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R83, { document }), [
    passed(R83, target, {
      1: Outcomes.WrapsText,
    }),
  ]);
});

test(`evaluate() fails a text node that clips overflow by not wrapping text
      using the \`white-space\` property`, async (t) => {
  const target = h.text("Hello world");

  const document = Document.of(
    [<div>{target}</div>],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          whiteSpace: "nowrap",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R83, { document }), [
    failed(R83, target, {
      1: Outcomes.ClipsText,
    }),
  ]);
});

test(`evaluate() fails a text node that clips overflow and sets a fixed height
      using the px unit`, async (t) => {
  const target = h.text("Hello world");

  const document = Document.of(
    [<div>{target}</div>],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          height: "20px",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R83, { document }), [
    failed(R83, target, {
      1: Outcomes.ClipsText,
    }),
  ]);
});

test(`evaluate() fails a text node that clips overflow and sets a fixed height
      using the vh unit`, async (t) => {
  const target = h.text("Hello world");

  const document = Document.of(
    [<div>{target}</div>],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          height: "1vh",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R83, { document }), [
    failed(R83, target, {
      1: Outcomes.ClipsText,
    }),
  ]);
});

test("evaluate() is inapplicable to a text node that is not visible", async (t) => {
  const document = Document.of(
    [<div hidden>Hello world</div>],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          whiteSpace: "nowrap",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R83, { document }), [inapplicable(R83)]);
});

test(`evaluate() is inapplicable to a text node that is excluded from the
      accessibility tree using the \`aria-hidden\` attribute`, async (t) => {
  const document = Document.of(
    [<div aria-hidden="true">Hello world</div>],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          whiteSpace: "nowrap",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R83, { document }), [inapplicable(R83)]);
});

test(`evaluate() is inapplicable to a text node with a fixed absolute height set
      via the style attribute`, async (t) => {
  const document = Document.of(
    [
      <div
        style={{
          height: "20px",
        }}
      >
        Hello world
      </div>,
    ],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R83, { document }), [inapplicable(R83)]);
});

test(`evaluate() is inapplicable to a text node with a fixed relative height`, async (t) => {
  const document = Document.of(
    [<div>Hello world</div>],
    [
      h.sheet([
        h.rule.style("div", {
          overflow: "hidden",
          height: "1.2em",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R83, { document }), [inapplicable(R83)]);
});
