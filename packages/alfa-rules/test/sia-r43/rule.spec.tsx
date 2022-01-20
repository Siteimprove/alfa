import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R43, { Outcomes } from "../../src/sia-r43/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluates() passes SVG with img role and a name", async (t) => {
  const target = (
    <svg role="img" aria-label="hello">
      <circle cx="50" cy="50" r="40" fill="yellow"></circle>
    </svg>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R43, { document }), [
    passed(R43, target, { 1: Outcomes.HasName("svg") }),
  ]);
});

test("evaluates() fails SVG with img role and no name", async (t) => {
  const target = (
    <svg role="img">
      <circle cx="50" cy="50" r="40" fill="yellow"></circle>
    </svg>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R43, { document }), [
    failed(R43, target, { 1: Outcomes.HasNoName("svg") }),
  ]);
});

test("evaluate() is applicable to nested SVG elements", async (t) => {
  const target = (
    <circle role="img" cx="50" cy="50" r="40" fill="yellow"></circle>
  );

  const document = h.document([<svg>{target}</svg>]);

  t.deepEqual(await evaluate(R43, { document }), [
    failed(R43, target, { 1: Outcomes.HasNoName("circle") }),
  ]);
});

test("evaluate() is inapplicable when there is no SVG", async (t) => {
  const target = <img src="foo.jpg" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R43, { document }), [inapplicable(R43)]);
});

test("evaluates() is inapplicable to SVG without explicit role", async (t) => {
  const target = (
    <svg>
      <circle cx="50" cy="50" r="40" fill="yellow"></circle>
    </svg>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R43, { document }), [inapplicable(R43)]);
});

test("evaluates() is inapplicable to presentational SVG", async (t) => {
  const target = (
    <svg role="presentation">
      <circle cx="50" cy="50" r="40" fill="yellow"></circle>
    </svg>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R43, { document }), [inapplicable(R43)]);
});
