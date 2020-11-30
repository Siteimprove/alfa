import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R62, { Outcomes } from "../../src/sia-r62/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";
import { oracle } from "../common/oracle";

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

test(`evaluate() fails an applicable <a> element that removes the default text
      decoration on hover and focus and is determined not to be distinguishable`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [<p>Hello {target}</p>],
    [
      h.sheet([
        h.rule.style("a:hover, a:focus", {
          textDecoration: "none",
        }),
      ]),
    ]
  );

  t.deepEqual(
    await evaluate(
      R62,
      { document },
      oracle({
        "is-distinguishable": true,
        "is-distinguishable-when-visited": true,
        "is-distinguishable-on-hover": false,
        "is-distinguishable-on-hover-when-visited": false,
        "is-distinguishable-on-focus": false,
        "is-distinguishable-on-focus-when-visited": false,
      })
    ),
    [
      failed(R62, target, {
        1: Outcomes.IsNotDistinguishable,
        2: Outcomes.IsNotDistinguishableWhenVisited,
      }),
    ]
  );
});

test(`evaluate() passes an applicable <a> element that removes the default text
      decoration and is determined to be distinguishable`, async (t) => {
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

  t.deepEqual(
    await evaluate(
      R62,
      { document },
      oracle({
        "is-distinguishable": true,
        "is-distinguishable-when-visited": true,
        "is-distinguishable-on-hover": true,
        "is-distinguishable-on-hover-when-visited": true,
        "is-distinguishable-on-focus": true,
        "is-distinguishable-on-focus-when-visited": true,
      })
    ),
    [
      passed(R62, target, {
        1: Outcomes.IsDistinguishable,
        2: Outcomes.IsDistinguishableWhenVisited,
      }),
    ]
  );
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

test(`evaluate() fails an applicable <a> element that removes the default text
      decoration and is determined not to be distinguishable`, async (t) => {
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

  t.deepEqual(
    await evaluate(
      R62,
      { document },
      oracle({
        "is-distinguishable": false,
        "is-distinguishable-when-visited": false,
        "is-distinguishable-on-hover": false,
        "is-distinguishable-on-hover-when-visited": false,
        "is-distinguishable-on-focus": false,
        "is-distinguishable-on-focus-when-visited": false,
      })
    ),
    [
      failed(R62, target, {
        1: Outcomes.IsNotDistinguishable,
        2: Outcomes.IsNotDistinguishableWhenVisited,
      }),
    ]
  );
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
