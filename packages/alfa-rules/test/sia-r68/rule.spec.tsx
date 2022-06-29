import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R68, { Outcomes } from "../../src/sia-r68/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a list with two list items", async (t) => {
  const target = (
    <div role="list">
      <span role="listitem">Item 1</span>
      <span role="listitem">Item 2</span>
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R68, { document }), [
    passed(R68, target, {
      1: Outcomes.HasCorrectOwnedElements("list"),
    }),
  ]);
});

test("evaluate() passes a table with a row and a row group", async (t) => {
  const target1 = (
    <span role="row">
      <span role="cell">Cell 1</span>
    </span>
  );

  const target2 = (
    <span role="row">
      <span role="cell">Cell 2</span>
    </span>
  );

  const target3 = <div role="rowgroup">{target2}</div>;

  const target4 = (
    <div role="table">
      {target1}
      {target3}
    </div>
  );

  const document = h.document([target4]);

  t.deepEqual(await evaluate(R68, { document }), [
    passed(R68, target4, {
      1: Outcomes.HasCorrectOwnedElements("table"),
    }),
    passed(R68, target1, {
      1: Outcomes.HasCorrectOwnedElements("row"),
    }),
    passed(R68, target3, {
      1: Outcomes.HasCorrectOwnedElements("rowgroup"),
    }),
    passed(R68, target2, {
      1: Outcomes.HasCorrectOwnedElements("row"),
    }),
  ]);
});

test("evaluate() passes a table with a caption and a row", async (t) => {
  const target1 = (
    <span role="row">
      <span role="cell">Cell</span>
    </span>
  );

  const target2 = (
    <div role="table">
      <caption>Caption</caption>
      {target1}
    </div>
  );

  const document = h.document([target2]);

  t.deepEqual(await evaluate(R68, { document }), [
    passed(R68, target2, {
      1: Outcomes.HasCorrectOwnedElements("table"),
    }),
    passed(R68, target1, {
      1: Outcomes.HasCorrectOwnedElements("row"),
    }),
  ]);
});

test("evaluate() passes a table with a caption and two rows", async (t) => {
  const target1 = (
    <span role="row">
      <span role="cell">Cell</span>
    </span>
  );

  const target2 = (
    <span role="row">
      <span role="cell">Cell</span>
    </span>
  );

  const target3 = (
    <div role="table">
      <caption>Caption</caption>
      {target1}
      {target2}
    </div>
  );

  const document = h.document([target3]);

  t.deepEqual(await evaluate(R68, { document }), [
    passed(R68, target3, {
      1: Outcomes.HasCorrectOwnedElements("table"),
    }),
    passed(R68, target1, {
      1: Outcomes.HasCorrectOwnedElements("row"),
    }),
    passed(R68, target2, {
      1: Outcomes.HasCorrectOwnedElements("row"),
    }),
  ]);
});

test("evaluate() passes a radiogroup with a radio and a label", async (t) => {
  const target = (
    <div role="radiogroup">
      <span role="radio" aria-labelledby="label" />
      <label id="label">Label</label>
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R68, { document }), [
    passed(R68, target, {
      1: Outcomes.HasCorrectOwnedElements("radiogroup"),
    }),
  ]);
});

test("evaluate() ignores non-element children when determining ownership", async (t) => {
  const target = (
    <div role="list">
      <span role="listitem">Item 1</span>
      Item 2
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R68, { document }), [
    passed(R68, target, {
      1: Outcomes.HasCorrectOwnedElements("list"),
    }),
  ]);
});

test("evaluate() fails a list with only a non-list item", async (t) => {
  const target = (
    <div role="list">
      <span>Item 1</span>
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R68, { document }), [
    failed(R68, target, {
      1: Outcomes.HasIncorrectOwnedElements("list"),
    }),
  ]);
});

test("evaluate() is inapplicable to aria-busy elements", async (t) => {
  const menu = (
    <ul role="menu" aria-busy="true">
      Loading
    </ul>
  );

  const document = h.document([menu]);
  t.deepEqual(await evaluate(R68, { document }), [inapplicable(R68)]);
});
