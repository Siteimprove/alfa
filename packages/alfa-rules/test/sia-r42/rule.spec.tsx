import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R42, { Outcomes } from "../../src/sia-r42/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluates() passes an implicit listitem inside a list`, async (t) => {
  const target = <li>Foo</li>;

  const document = h.document([<ul>{target}</ul>]);

  t.deepEqual(await evaluate(R42, { document }), [
    passed(R42, target, {
      1: Outcomes.IsOwnedByContextRole,
    }),
  ]);
});

test(`evaluates() passes an explicit listitem inside a list`, async (t) => {
  const target = <div role="listitem">Foo</div>;

  const document = h.document([<div role="list">{target}</div>]);

  t.deepEqual(await evaluate(R42, { document }), [
    passed(R42, target, {
      1: Outcomes.IsOwnedByContextRole,
    }),
  ]);
});

test(`evaluates() fails an orphaned listitem`, async (t) => {
  const target = <div role="listitem">Foo</div>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R42, { document }), [
    failed(R42, target, {
      1: Outcomes.IsNotOwnedByContextRole,
    }),
  ]);
});

test(`evaluates() skips through container nodes`, async (t) => {
  const target = <div role="listitem">Foo</div>;

  const document = h.document([
    <div role="list">
      <div>{target}</div>
    </div>,
  ]);

  t.deepEqual(await evaluate(R42, { document }), [
    passed(R42, target, {
      1: Outcomes.IsOwnedByContextRole,
    }),
  ]);
});

test(`evaluates() fails listitem in intermediate non-container nodes`, async (t) => {
  const target = <div role="listitem">Foo</div>;

  const document = h.document([
    <div role="list">
      <div role="menu">{target}</div>
    </div>,
  ]);

  t.deepEqual(await evaluate(R42, { document }), [
    failed(R42, target, {
      1: Outcomes.IsNotOwnedByContextRole,
    }),
  ]);
});

test(`evaluates() follows \`aria-owns\``, async (t) => {
  const target = (
    <div id="target" role="listitem">
      Foo
    </div>
  );

  const document = h.document([
    <div role="list" aria-owns="target"></div>,
    target,
  ]);

  t.deepEqual(await evaluate(R42, { document }), [
    passed(R42, target, {
      1: Outcomes.IsOwnedByContextRole,
    }),
  ]);
});

test(`evaluates() passes a \`row\` inside a \`rowgroup\` inside a \`table\``, async (t) => {
  const cell = <td>Foo</td>;
  const row = <tr>{cell}</tr>;
  const rowGroup = <tbody>{row}</tbody>;

  const document = h.document([<table>{rowGroup}</table>]);

  t.deepEqual(await evaluate(R42, { document }), [
    passed(R42, rowGroup, {
      1: Outcomes.IsOwnedByContextRole,
    }),
    passed(R42, row, {
      1: Outcomes.IsOwnedByContextRole,
    }),
    passed(R42, cell, {
      1: Outcomes.IsOwnedByContextRole,
    }),
  ]);
});

test(`evaluates() fails a \`row\` inside an orphaned \`rowgroup\``, async (t) => {
  const row = <div role="row">Foo</div>;
  const rowGroup = <div role="rowgroup">{row}</div>;

  const document = h.document([rowGroup]);

  t.deepEqual(await evaluate(R42, { document }), [
    failed(R42, rowGroup, {
      1: Outcomes.IsNotOwnedByContextRole,
    }),
    failed(R42, row, {
      1: Outcomes.IsNotOwnedByContextRole,
    }),
  ]);
});

test(`evaluates() is inapplicable when on element whose role has no required parents`, async (t) => {
  const document = h.document([<h1>Header</h1>]);

  t.deepEqual(await evaluate(R42, { document }), [inapplicable(R42)]);
});

test(`evaluates() is inapplicable on element that is not in the accessiblity tree`, async (t) => {
  const document = h.document([
    <div role="listitem" style={{ display: "none" }}></div>,
  ]);

  t.deepEqual(await evaluate(R42, { document }), [inapplicable(R42)]);
});
