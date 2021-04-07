import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R62, { Outcomes } from "../../src/sia-r62/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes an <a> element with a <p> parent element with non-link
      text content`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of([<p>Hello {target}</p>]);

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
      1: Outcomes.IsDistinguishable,
      2: Outcomes.IsDistinguishableWhenVisited,
    }),
  ]);
});

test(`evaluate() passes an <a> element with a <p> parent element with non-link
      text content in a <span> child element`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of([
    <p>
      <span>Hello</span> {target}
    </p>,
  ]);

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
      1: Outcomes.IsDistinguishable,
      2: Outcomes.IsDistinguishableWhenVisited,
    }),
  ]);
});

test(`evaluate() fails an <a> element that removes the default text decoration
      without replacing it with another distinguishing feature`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
      1: Outcomes.IsNotDistinguishable,
      2: Outcomes.IsNotDistinguishableWhenVisited,
    }),
  ]);
});

test(`evaluate() passes an applicable <a> element that removes the default text
      decoration and instead applies an outline`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
          outline: "auto",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
      1: Outcomes.IsDistinguishable,
      2: Outcomes.IsDistinguishableWhenVisited,
    }),
  ]);
});

test(`evaluate() passes an applicable <a> element that removes the default text
      decoration and instead applies a bottom border`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "#000",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
      1: Outcomes.IsDistinguishable,
      2: Outcomes.IsDistinguishableWhenVisited,
    }),
  ]);
});

test(`evaluate() fails an <a> element that has no distinguishing features and
      has a transparent bottom border`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "transparent",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
      1: Outcomes.IsNotDistinguishable,
      2: Outcomes.IsNotDistinguishableWhenVisited,
    }),
  ]);
});

test(`evaluate() fails an <a> element that has no distinguishing features and
      has a 0px bottom border`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
          borderBottomWidth: "0px",
          borderBottomStyle: "solid",
          borderBottomColor: "#000",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
      1: Outcomes.IsNotDistinguishable,
      2: Outcomes.IsNotDistinguishableWhenVisited,
    }),
  ]);
});

test(`evaluate() passes an applicable <a> element that removes the default text
      decoration and instead applies a background color`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
          background: "red",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
      1: Outcomes.IsDistinguishable,
      2: Outcomes.IsDistinguishableWhenVisited,
    }),
  ]);
});

test(`evaluate() fails an <a> element that has no distinguishing features but is
      part of a paragraph with a background color`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("p", {
          background: "red",
        }),

        h.rule.style("a", {
          textDecoration: "none",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
      1: Outcomes.IsNotDistinguishable,
      2: Outcomes.IsNotDistinguishableWhenVisited,
    }),
  ]);
});

test(`evaluate() fails an <a> element that has no distinguishing features and
      has a background color equal to that of the paragraph`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("p", {
          background: "red",
        }),

        h.rule.style("a", {
          textDecoration: "none",
          background: "red",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
      1: Outcomes.IsNotDistinguishable,
      2: Outcomes.IsNotDistinguishableWhenVisited,
    }),
  ]);
});

test(`evaluate() is inapplicable to an <a> element with no visible text content`, async (t) => {
  const target = (
    <a href="#">
      <span hidden>Link</span>
    </a>
  );

  const document = Document.of([<p>Hello {target}</p>]);

  t.deepEqual(await evaluate(R62, { document }), [inapplicable(R62)]);
});

test(`evaluate() is inapplicable to an <a> element with a <p> parent element
      no non-link text content`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of([<p>{target}</p>]);

  t.deepEqual(await evaluate(R62, { document }), [inapplicable(R62)]);
});

test(`evaluate() is inapplicable to an <a> element with a <p> parent element
      no visible non-link text content`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of([
    <p>
      <span hidden>Hello</span> {target}
    </p>,
  ]);

  t.deepEqual(await evaluate(R62, { document }), [inapplicable(R62)]);
});

test(`evaluate() passes an <a> element with a <div role="paragraph"> parent element
      with non-link text content in a <span> child element`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of([
    <div role="paragraph">
      <span>Hello</span> {target}
    </div>,
  ]);

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
      1: Outcomes.IsDistinguishable,
      2: Outcomes.IsDistinguishableWhenVisited,
    }),
  ]);
});

test(`evaluate() is inapplicable to an <a> element with a <p> parent element
      whose role has been changed`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of([
    <p role="generic">
      <span>Hello</span> {target}
    </p>,
  ]);

  t.deepEqual(await evaluate(R62, { document }), [inapplicable(R62)]);
});
