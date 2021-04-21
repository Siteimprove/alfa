import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R42, { Outcomes } from "../../src/sia-r42/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluates() passes an implicit listitem inside a list`, async (t) => {
  const target = <li>Foo</li>;

  const document = Document.of([<ul>{target}</ul>]);

  t.deepEqual(await evaluate(R42, { document }), [
    passed(R42, target, {
      1: Outcomes.IsOwnedByContextRole(
        "listitem",
        [["directory"], ["list"]],
        ["list"]
      ),
    }),
  ]);
});

test(`evaluates() passes an explicit listitem inside a list`, async (t) => {
  const target = <div role="listitem">Foo</div>;

  const document = Document.of([<div role="list">{target}</div>]);

  t.deepEqual(await evaluate(R42, { document }), [
    passed(R42, target, {
      1: Outcomes.IsOwnedByContextRole(
        "listitem",
        [["directory"], ["list"]],
        ["list"]
      ),
    }),
  ]);
});

test(`evaluates() fails an orphaned listitem`, async (t) => {
  const target = <div role="listitem">Foo</div>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R42, { document }), [
    failed(R42, target, {
      1: Outcomes.IsNotOwnedByContextRole("listitem", [
        ["directory"],
        ["list"],
      ]),
    }),
  ]);
});

test(`evaluates() skips through container nodes`, async (t) => {
  const target = <div role="listitem">Foo</div>;

  const document = Document.of([
    <div role="list">
      <div>{target}</div>
    </div>,
  ]);

  t.deepEqual(await evaluate(R42, { document }), [
    passed(R42, target, {
      1: Outcomes.IsOwnedByContextRole(
        "listitem",
        [["directory"], ["list"]],
        ["list"]
      ),
    }),
  ]);
});

test(`evaluates() fails listitem in intermediate non-container nodes`, async (t) => {
  const target = <div role="listitem">Foo</div>;

  const document = Document.of([
    <div role="list">
      <div role="menu">{target}</div>
    </div>,
  ]);

  t.deepEqual(await evaluate(R42, { document }), [
    failed(R42, target, {
      1: Outcomes.IsNotOwnedByContextRole("listitem", [
        ["directory"],
        ["list"],
      ]),
    }),
  ]);
});

test(`evaluates() follows \`aria-owns\``, async (t) => {
  const target = (
    <div id="target" role="listitem">
      Foo
    </div>
  );

  const document = Document.of([
    <div role="list" aria-owns="target"></div>,
    target,
  ]);

  t.deepEqual(await evaluate(R42, { document }), [
    passed(R42, target, {
      1: Outcomes.IsOwnedByContextRole(
        "listitem",
        [["directory"], ["list"]],
        ["list"]
      ),
    }),
  ]);
});

test(`evaluates() passes a \`row\` inside a \`rowgroup\` inside a \`table\``, async (t) => {
  const cell = <td>Foo</td>;
  const row = <tr>{cell}</tr>;
  const rowGroup = <tbody>{row}</tbody>;

  const document = Document.of([<table>{rowGroup}</table>]);

  t.deepEqual(await evaluate(R42, { document }), [
    passed(R42, rowGroup, {
      1: Outcomes.IsOwnedByContextRole(
        "rowgroup",
        [["grid"], ["table"], ["treegrid"]],
        ["table"]
      ),
    }),
    passed(R42, row, {
      1: Outcomes.IsOwnedByContextRole(
        "row",
        [
          ["grid"],
          ["table"],
          ["treegrid"],
          ["rowgroup", "grid"],
          ["rowgroup", "table"],
          ["rowgroup", "treegrid"],
        ],
        ["rowgroup", "table"]
      ),
    }),
    passed(R42, cell, {
      1: Outcomes.IsOwnedByContextRole("cell", [["row"]], ["row"]),
    }),
  ]);
});

test(`evaluates() fails a \`row\` inside an orphaned \`rowgroup\``, async (t) => {
  const row = <div role="row">Foo</div>;
  const rowGroup = <div role="rowgroup">{row}</div>;

  const document = Document.of([rowGroup]);

  t.deepEqual(await evaluate(R42, { document }), [
    failed(R42, rowGroup, {
      1: Outcomes.IsNotOwnedByContextRole("rowgroup", [
        ["grid"],
        ["table"],
        ["treegrid"],
      ]),
    }),
    failed(R42, row, {
      1: Outcomes.IsNotOwnedByContextRole("row", [
        ["grid"],
        ["table"],
        ["treegrid"],
        ["rowgroup", "grid"],
        ["rowgroup", "table"],
        ["rowgroup", "treegrid"],
      ]),
    }),
  ]);
});

test(`evaluates() is inapplicable when on element whose role has no required parents`, async (t) => {
  const document = Document.of([<h1>Header</h1>]);

  t.deepEqual(await evaluate(R42, { document }), [inapplicable(R42)]);
});

test(`evaluates() is inapplicable on element that is not in the accessiblity tree`, async (t) => {
  const document = Document.of([
    <div role="listitem" style={{ display: "none" }}></div>,
  ]);

  t.deepEqual(await evaluate(R42, { document }), [inapplicable(R42)]);
});
