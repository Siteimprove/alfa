import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R62, { Outcomes } from "../../src/sia-r62/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

/**
 * @internal
 * Removing all decoration from links
 */
const emptyStyle = h.rule.style("a", {
  outline: "none",
  textDecoration: "none",
});

test(`evaluate() passes an <a> element with a <p> parent element with non-link
      text content`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of([<p>Hello {target}</p>]);

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
      1: Outcomes.IsDistinguishable,
      2: Outcomes.IsDistinguishableHover,
      3: Outcomes.IsDistinguishableFocus,
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
      2: Outcomes.IsDistinguishableHover,
      3: Outcomes.IsDistinguishableFocus,
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
          outline: "none",
          textDecoration: "none",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
      1: Outcomes.IsNotDistinguishable,
      2: Outcomes.IsNotDistinguishableHover,
      3: Outcomes.IsNotDistinguishableFocus,
    }),
  ]);
});

test(`evaluate() fails an <a> element that removes the default text decoration
      on hover without replacing it with another distinguishing feature`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a:hover", {
          textDecoration: "none",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
      1: Outcomes.IsDistinguishable,
      2: Outcomes.IsNotDistinguishableHover,
      3: Outcomes.IsDistinguishableFocus,
    }),
  ]);
});

test(`evaluate() fails an <a> element that removes the default text decoration
      and focus outline on focus without replacing them with another
      distinguishing feature`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a:focus", {
          outline: "none",
          textDecoration: "none",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
      1: Outcomes.IsDistinguishable,
      2: Outcomes.IsDistinguishableHover,
      3: Outcomes.IsNotDistinguishableFocus,
    }),
  ]);
});

test(`evaluate() fails an <a> element that removes the default text decoration
      and focus outline on hover and focus without replacing them with another
      distinguishing feature`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a:focus", {
          outline: "none",
        }),

        h.rule.style("a:hover, a:focus", {
          textDecoration: "none",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
      1: Outcomes.IsDistinguishable,
      2: Outcomes.IsNotDistinguishableHover,
      3: Outcomes.IsNotDistinguishableFocus,
    }),
  ]);
});

test(`evaluate() fails an <a> element that applies a text decoration only on
      hover`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        emptyStyle,

        h.rule.style("a:hover", {
          textDecoration: "underline",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
      1: Outcomes.IsNotDistinguishable,
      2: Outcomes.IsDistinguishableHover,
      3: Outcomes.IsNotDistinguishableFocus,
    }),
  ]);
});

test(`evaluate() fails an <a> element that applies a text decoration only on
      focus`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        emptyStyle,

        h.rule.style("a:focus", {
          textDecoration: "underline",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
      1: Outcomes.IsNotDistinguishable,
      2: Outcomes.IsNotDistinguishableHover,
      3: Outcomes.IsDistinguishableFocus,
    }),
  ]);
});
/*
test(`evaluate() fails an <a> element that applies a text decoration only on
      hover and focus`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        emptyStyle,

        h.rule.style("a:hover, a:focus", {
          textDecoration: "underline",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
      1: Outcomes.IsNotDistinguishable,
      2: Outcomes.IsDistinguishableHover,
      3: Outcomes.IsDistinguishableFocus,
    }),
  ]);
});
/*
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
          borderBottom: "1px solid #000",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, {
      1: Outcomes.IsDistinguishable,
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
          borderBottom: "1px solid transparent",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
      1: Outcomes.IsNotDistinguishable,
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
          borderBottom: "0px solid #000",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    failed(R62, target, {
      1: Outcomes.IsNotDistinguishable,
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

test(`evaluate() passes a link whose bolder than surrounding text`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [
      <p>
        <span>Hello</span> {target}
      </p>,
    ],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
          fontWeight: "bold",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R62, { document }), [
    passed(R62, target, { 1: Outcomes.IsDistinguishable }),
  ]);
});
*/
