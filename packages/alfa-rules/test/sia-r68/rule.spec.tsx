import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R68, { Outcomes } from "../../src/sia-r68/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a list with two list items", async (t) => {
  const list = (
    <div role="list">
      <span role="listitem">Item 1</span>
      <span role="listitem">Item 2</span>
    </div>
  );

  const document = Document.of([list]);

  t.deepEqual(await evaluate(R68, { document }), [
    passed(R68, list, { 1: Outcomes.HasCorrectOwnedElements }),
  ]);
});

test("evaluate() passes a table with a row and a row group", async (t) => {
  const row1 = (
    <span role="row">
      <span role="cell">Cell 1</span>
    </span>
  );

  const row2 = (
    <span role="row">
      <span role="cell">Cell 2</span>
    </span>
  );

  const rowgroup = <div role="rowgroup">{row2}</div>;

  const table = (
    <div role="table">
      {row1}
      {rowgroup}
    </div>
  );

  const document = Document.of([table]);

  t.deepEqual(await evaluate(R68, { document }), [
    passed(R68, table, { 1: Outcomes.HasCorrectOwnedElements }),
    passed(R68, row1, { 1: Outcomes.HasCorrectOwnedElements }),
    passed(R68, rowgroup, { 1: Outcomes.HasCorrectOwnedElements }),
    passed(R68, row2, { 1: Outcomes.HasCorrectOwnedElements }),
  ]);
});

test("evaluate() passes a table with a caption and a row", async (t) => {
  const row = (
    <span role="row">
      <span role="cell">Cell</span>
    </span>
  );

  const table = (
    <div role="table">
      <caption>Caption</caption>
      {row}
    </div>
  );

  const document = Document.of([table]);

  t.deepEqual(await evaluate(R68, { document }), [
    passed(R68, table, { 1: Outcomes.HasCorrectOwnedElements }),
    passed(R68, row, { 1: Outcomes.HasCorrectOwnedElements }),
  ]);
});

test("evaluate() passes a radiogroup with a radio and a label", async (t) => {
  const radio = <span role="radio" aria-labelledby="label" />;

  const radiogroup = (
    <div role="radiogroup">
      {radio}
      <label id="label">Label</label>
    </div>
  );

  const document = Document.of([radiogroup]);

  t.deepEqual(await evaluate(R68, { document }), [
    passed(R68, radiogroup, { 1: Outcomes.HasCorrectOwnedElements }),
  ]);
});

test("evaluate() ignores non-element children when determining ownership", async (t) => {
  // Don't remove the space after the list item; it's the non-element child!
  const list = (
    <div role="list">
      <span role="listitem">Item 1</span>{" "}
    </div>
  );

  const document = Document.of([list]);

  t.deepEqual(await evaluate(R68, { document }), [
    passed(R68, list, { 1: Outcomes.HasCorrectOwnedElements }),
  ]);
});

test("evaluate() fails a list with only a non-list item", async (t) => {
  const list = (
    <div role="list">
      <span>Item 1</span>
    </div>
  );

  const document = Document.of([list]);

  t.deepEqual(await evaluate(R68, { document }), [
    failed(R68, list, { 1: Outcomes.HasIncorrectOwnedElements }),
  ]);
});

test("evaluate() is inapplicable to aria-busy elements", async (t) => {
  const menu = (
    <ul role="menu" aria-busy="true">
      Loading
    </ul>
  );

  const document = Document.of([menu]);
  t.deepEqual(await evaluate(R68, { document }), [inapplicable(R68)]);
});
