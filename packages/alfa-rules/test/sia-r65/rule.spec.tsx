import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R65, { Outcomes } from "../../src/sia-r65/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";
import { oracle } from "../common/oracle";

test(`evaluate() passes an <a> element that uses the default focus outline`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of([target, <button />]);

  t.deepEqual(await evaluate(R65, { document }), [
    passed(R65, target, {
      1: Outcomes.HasFocusIndicator,
    }),
    passed(R65, <button />, {
      1: Outcomes.HasFocusIndicator,
    }),
  ]);
});

test(`evaluate() passes an <a> element that uses a non-default focus outline`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [target, <button />],
    [
      h.sheet([
        h.rule.style("a:focus", {
          outline: "2px solid blue",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R65, { document }), [
    passed(R65, target, {
      1: Outcomes.HasFocusIndicator,
    }),
    passed(R65, <button />, {
      1: Outcomes.HasFocusIndicator,
    }),
  ]);
});

test(`evaluate() fails an <a> element that removes the default focus outline and
      is determined to have no other focus indicator`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [target, <button />],
    [
      h.sheet([
        h.rule.style("a:focus", {
          outline: "none",
        }),
      ]),
    ]
  );

  t.deepEqual(
    await evaluate(
      R65,
      { document },
      oracle({
        "has-focus-indicator": false,
      })
    ),
    [
      failed(R65, target, {
        1: Outcomes.HasNoFocusIndicator,
      }),
      passed(R65, <button />, {
        1: Outcomes.HasFocusIndicator,
      }),
    ]
  );
});

test(`evaluate() passes an <a> element that removes the default focus outline
      and is determined to have some other focus indicator`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [target, <button />],
    [
      h.sheet([
        h.rule.style("a:focus", {
          outline: "none",
        }),
      ]),
    ]
  );

  t.deepEqual(
    await evaluate(
      R65,
      { document },
      oracle({
        "has-focus-indicator": true,
      })
    ),
    [
      passed(R65, target, {
        1: Outcomes.HasFocusIndicator,
      }),
      passed(R65, <button />, {
        1: Outcomes.HasFocusIndicator,
      }),
    ]
  );
});

test(`evaluate() passes an <a> element that removes the default focus outline
      and applies an underline on focus`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [target, <button />],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
        }),

        h.rule.style("a:focus", {
          outline: "none",
          textDecoration: "underline",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R65, { document }), [
    passed(R65, target, {
      1: Outcomes.HasFocusIndicator,
    }),
    passed(R65, <button />, {
      1: Outcomes.HasFocusIndicator,
    }),
  ]);
});

test(`evaluate() passes an <a> element that removes the default focus outline
      and whose parent applies an outline when focus is within the parent`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [<div>{target}</div>, <button />],
    [
      h.sheet([
        h.rule.style("div:focus-within", {
          outline: "1px solid blue",
        }),

        h.rule.style("a:focus", {
          outline: "none",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R65, { document }), [
    passed(R65, target, {
      1: Outcomes.HasFocusIndicator,
    }),
    passed(R65, <button />, {
      1: Outcomes.HasFocusIndicator,
    }),
  ]);
});

test(`evaluate() passes an <a> element that removes the default focus outline
      and whose child applies an outline when the <a> element is focused`, async (t) => {
  const target = (
    <a href="#">
      <span>Link</span>
    </a>
  );

  const document = Document.of(
    [target, <button />],
    [
      h.sheet([
        h.rule.style("a:focus", {
          outline: "none",
        }),

        h.rule.style("a:focus span", {
          outline: "1px solid blue",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R65, { document }), [
    passed(R65, target, {
      1: Outcomes.HasFocusIndicator,
    }),
    passed(R65, <button />, {
      1: Outcomes.HasFocusIndicator,
    }),
  ]);
});

test(`evaluate() passes an <a> element that removes the default focus outline
      and applies an outline only when focus should be visible`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [target, <button />],
    [
      h.sheet([
        h.rule.style("a:focus", {
          outline: "none",
        }),

        h.rule.style("a:focus:focus-visible", {
          outline: "1px solid blue",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R65, { document }), [
    passed(R65, target, {
      1: Outcomes.HasFocusIndicator,
    }),
    passed(R65, <button />, {
      1: Outcomes.HasFocusIndicator,
    }),
  ]);
});

test(`evaluate() fails an <a> element that removes the default focus outline
      only when focus should be visible and is determined to have no other focus
      indicator`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = Document.of(
    [target, <button />],
    [
      h.sheet([
        h.rule.style("a:focus:focus-visible", {
          outline: "none",
        }),
      ]),
    ]
  );

  t.deepEqual(
    await evaluate(
      R65,
      { document },
      oracle({
        "has-focus-indicator": false,
      })
    ),
    [
      failed(R65, target, {
        1: Outcomes.HasNoFocusIndicator,
      }),
      passed(R65, <button />, {
        1: Outcomes.HasFocusIndicator,
      }),
    ]
  );
});
