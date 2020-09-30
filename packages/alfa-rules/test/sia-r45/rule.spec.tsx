import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R45, { Outcomes } from "../../src/sia-r45/rule";

import { evaluate } from "../common/evaluate";
import { failed, inapplicable, passed } from "../common/outcome";

test(`evaluate() passes when tokens in headers list refer to cells in the same
      table`, async (t) => {
  const target = h.attribute("headers", "header1 header2");

  const document = Document.of([
    <table>
      <thead>
        <tr>
          <th id="header1">Projects</th>
          <th id="header2">Exams</th>
        </tr>
      </thead>
      <tbody>
        <tr>{h("td", [h.attribute("colspan", "2"), target], ["15%"])}</tr>
      </tbody>
    </table>,
  ]);

  t.deepEqual(await evaluate(R45, { document }), [
    passed(R45, target, {
      1: Outcomes.HeadersRefersToCellInTable,
      2: Outcomes.HeadersDoesNotRefersToSelf,
    }),
  ]);
});

test(`evaluate() fails when some tokens in headers list do not refer to cells in
      the same table`, async (t) => {
  const target = h.attribute("headers", "header1 header2");

  const document = Document.of([
    <table>
      <thead>
        <tr>
          <th id="header1">Projects</th>
          <th>Exams</th>
        </tr>
      </thead>
      <tbody>
        <tr>{h("td", [h.attribute("colspan", "2"), target], ["15%"])}</tr>
      </tbody>
    </table>,
  ]);

  t.deepEqual(await evaluate(R45, { document }), [
    failed(R45, target, {
      1: Outcomes.HeadersDoesNotReferToCellsInTable,
      2: Outcomes.HeadersDoesNotRefersToSelf,
    }),
  ]);
});

test(`evaluate() fails when some token in the headers list refer to the cell
      itself`, async (t) => {
  const target = h.attribute("headers", "header cell");

  const document = Document.of([
    <table>
      <thead>
        <tr>
          <th id="header">Projects</th>
          <th>Exams</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          {h(
            "td",
            [h.attribute("id", "cell"), h.attribute("colspan", "2"), target],
            ["15%"]
          )}
        </tr>
      </tbody>
    </table>,
  ]);

  t.deepEqual(await evaluate(R45, { document }), [
    failed(R45, target, {
      1: Outcomes.HeadersRefersToCellInTable,
      2: Outcomes.HeadersRefersToSelf,
    }),
  ]);
});

test("evaluate() is inapplicable to a table without headers attributes", async (t) => {
  const document = Document.of([
    <table>
      <thead>
        <tr>
          <th>Projects</th>
          <th>Exams</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan={2}>15%</td>
        </tr>
      </tbody>
    </table>,
  ]);

  t.deepEqual(await evaluate(R45, { document }), [inapplicable(R45)]);
});
