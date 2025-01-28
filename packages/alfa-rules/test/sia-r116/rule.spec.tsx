import { type Element, h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R116, { Outcomes } from "../../dist/sia-r116/rule.js";

import { evaluate } from "../common/evaluate.js";
import { failed, inapplicable, passed } from "../common/outcome.js";

test("evaluate() passes summary elements with an accessible name from aria-label", async (t) => {
  const target = (
    <summary aria-label="hello">Opening times</summary>
  ) as Element<"summary">;

  const document = h.document([
    <details>
      {target}
      <p>This is a website. We are available 24/7.</p>
    </details>,
  ]);

  t.deepEqual(await evaluate(R116, { document }), [
    passed(R116, target, {
      1: Outcomes.HasAccessibleName,
    }),
  ]);
});

test("evaluate() passes summary elements with an accessible name from content", async (t) => {
  const target = (<summary>Opening times</summary>) as Element<"summary">;

  const document = h.document([
    <details>
      {target}
      <p>This is a website. We are available 24/7.</p>
    </details>,
  ]);

  t.deepEqual(await evaluate(R116, { document }), [
    passed(R116, target, {
      1: Outcomes.HasAccessibleName,
    }),
  ]);
});

test("evaluate() passes summary elements that are not the first children", async (t) => {
  const target = (<summary>Opening times</summary>) as Element<"summary">;

  const document = h.document([
    <details>
      <p>This is a website. We are available 24/7.</p>
      {target}
    </details>,
  ]);

  t.deepEqual(await evaluate(R116, { document }), [
    passed(R116, target, {
      1: Outcomes.HasAccessibleName,
    }),
  ]);
});

test("evaluate() is only applicable to the first summary element child", async (t) => {
  const target = (<summary>Opening times</summary>) as Element<"summary">;

  const document = h.document([
    <details>
      {target}
      <summary>Hello</summary>
      <p>This is a website. We are available 24/7.</p>
    </details>,
  ]);

  t.deepEqual(await evaluate(R116, { document }), [
    passed(R116, target, {
      1: Outcomes.HasAccessibleName,
    }),
  ]);
});

test("evaluate() fails summary elements without an accessible name", async (t) => {
  const target = (<summary></summary>) as Element<"summary">;

  const document = h.document([
    <details>
      {target}
      <p>This is a website. We are available 24/7.</p>
    </details>,
  ]);

  t.deepEqual(await evaluate(R116, { document }), [
    failed(R116, target, {
      1: Outcomes.HasNoAccessibleName,
    }),
  ]);
});

test("evaluate() applies to element where the presentational conflict triggers", async (t) => {
  const target = (<summary role="none"></summary>) as Element<"summary">;

  const document = h.document([
    <details>
      {target}
      <p>This is a website. We are available 24/7.</p>
    </details>,
  ]);

  t.deepEqual(await evaluate(R116, { document }), [
    failed(R116, target, {
      1: Outcomes.HasNoAccessibleName,
    }),
  ]);
});

test("evaluate() is inapplicable to summary elements that are not summary for their parent details", async (t) => {
  const document = h.document([
    <summary>Isolated</summary>,
    <details>
      <div>
        <summary>Nested</summary>
      </div>
      <p>This is a website. We are available 24/7.</p>
    </details>,
  ]);

  t.deepEqual(await evaluate(R116, { document }), [inapplicable(R116)]);
});

test("evaluate() is inapplicable to summary elements that are not exposed", async (t) => {
  const document = h.document([
    <details style={{ display: "none" }}>
      <summary>Opening times</summary>
      <p>This is a website. We are available 24/7.</p>
    </details>,
  ]);

  t.deepEqual(await evaluate(R116, { document }), [inapplicable(R116)]);
});

test("evaluate() is inapplicable to summary elements with an explicit role", async (t) => {
  const document = h.document([
    <details>
      <summary role="button">Opening times</summary>
      <p>This is a website. We are available 24/7.</p>
    </details>,
  ]);

  t.deepEqual(await evaluate(R116, { document }), [inapplicable(R116)]);
});
